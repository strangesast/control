const express = require('express'),
      //session = require('express-session'),
      bodyParser = require('body-parser'),
      multer = require('multer'),
      passport = require('passport'),
      //LocalStrategy = require('passport-local').Strategy,
      jwt = require('jsonwebtoken'),
      JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt;
      Influx = require('influx'),
      mongodb = require('mongodb'),
      MongoClient = mongodb.MongoClient,
      ObjectID = mongodb.ObjectID,
      //RedisStore = require('connect-redis')(session),
      //sessionStore = new RedisStore({ host: 'localhost', port: 6379 }),
      app = express(),
      upload = multer(),
      //ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn,
      InfluxDB = Influx.InfluxDB,
      { escape } = Influx,
      WebSocketServer = require('ws').Server,
      { Observable, Subject, BehaviorSubject, ReplaySubject } = require('rxjs'),
      fs = require('fs'),
      path = require('path')

const dataDir = '../data';
const defaultObjects = fs.readdirSync(dataDir)
  .map(fname => path.join(dataDir, fname))
  .filter(fpath => fs.statSync(fpath).isFile() && fpath.endsWith('.json'))
  .map(fpath => JSON.parse(fs.readFileSync(fpath, 'utf8')))
  .reduce((a, obj) => Object.assign(a, obj), {});


// database configuration
const host = 'localhost';
const databaseName = 'topview';
const { FLOAT, STRING, INTEGER } = Influx.FieldType;
// influx measurements schema
const schema = [
  {
    measurement: 'temperatures',
    fields: {
      value: FLOAT
    },
    tags: [
      // id from mongo
      'point',
      'area'
    ]
  },
  {
    measurement: 'setpoints',
    fields: {
      value: FLOAT,
      by: STRING, // who set it
      nonce: STRING // used to determine if request was carried out
    },
    tags: ['area'] // for now set points are attached to areas
  }
];

const recalcInterval = 2000;
const initTemp = 70;
const initTempSpread = 4;
const precision = 10;

function generateInitTemp() {
  let t = initTemp + (Math.random() - 1)*initTempSpread;
  return Math.floor(t*precision)/precision;
}

function calcTempChange(t, sp) {
  let v = sp - t;
  let dt = Math.sign(v)*(Math.random()-0.5)*Math.pow(Math.E, -Math.pow(v, 2)) + v/2;
  return Math.floor(dt*precision)/precision;
}

function fixIds(objs) {
  for (let obj of objs) {
    for (let prop in obj) {
      let val = obj[prop];
      if (val && typeof val === 'string' && val.length == 24) {
        try {
          obj[prop] = ObjectID.createFromHexString(val);
        } catch (e) {}
      }
    }
  }
}

var mongo, influx;
(async function init() {
  // mongo setup
  mongo = await MongoClient.connect(`mongodb://${ host }:27017/${ databaseName }`);
  // create collections
  await mongo.dropDatabase();
  let usersCollection = await mongo.createCollection('users', {
    validator: {
      '$and': [
        { username: { '$type': 'string' }},
        { password: { '$type': 'string' }}
      ]
    }
  });
  await usersCollection.ensureIndex('username', { name: 'username', unique: true });
  await usersCollection.insertMany(defaultObjects.users);

  // groups
  let groupsCollection = await mongo.createCollection('groups');
  await groupsCollection.ensureIndex('name', { name: 'name', unique: true });
  await groupsCollection.insertMany(defaultObjects.groups);

  // applications
  let applicationsCollection = await mongo.createCollection('applications');
  await applicationsCollection.insertMany(defaultObjects.applications);

  fixIds(defaultObjects.points);
  fixIds(defaultObjects.areas);
  fixIds(defaultObjects.features);

  let buildingsCollection = await mongo.createCollection('buildings');
  await buildingsCollection.insertMany(defaultObjects.buildings);

  let pointsCollection = await mongo.createCollection('points');
  await pointsCollection.insertMany(defaultObjects.points);

  let areasCollection = await mongo.createCollection('areas');
  await areasCollection.insertMany(defaultObjects.areas);

  let featuresCollection = await mongo.createCollection('features');
  await featuresCollection.insertMany(defaultObjects.features);

  
  // influx setup, init
  influx = new InfluxDB({ host, database: databaseName, schema });
  let names = await influx.getDatabaseNames();
  if (names.includes(databaseName)) {
    await influx.dropDatabase(databaseName);
  }
  await influx.createDatabase(databaseName);

  // setpoints from unique areas from sensors

  let setPoints = (await areasCollection.find({}).toArray()).map(area => ({
    measurement: 'setpoints',
    tags: { area: area._id },
    fields: {
      value: generateInitTemp(),
      by: 'init',
      nonce: '1234'
    }
  }));
  let tempMeasurements = (await pointsCollection.find({}).toArray()).map(({ area, _id }) => ({
    measurement: 'temperatures',
    tags: { area, point: _id },
    fields: { value: generateInitTemp() }
  }));
  await influx.writePoints(setPoints.concat(tempMeasurements));

  // thermostat loop
  (async function(sleepTime) {
    let successful = true;
    while (successful) {
      let setPoints = await influx.query(`SELECT last(value) FROM temperatures GROUP BY area`);
      let setPointMap = {};
      for (let { area, last } of setPoints) {
        setPointMap[area] = last;
      }

      let temps = await influx.query(`SELECT last(value) FROM temperatures GROUP BY area,point`);
      let values = [];
      for (let { area, point, last } of temps) {
        let sp = setPointMap[area];
        let dt = calcTempChange(last, sp);
        if (Math.abs(dt) > 0) {
          values.push({
            measurement: 'temperatures',
            tags: { area, point },
            fields: { value: last + dt }
          });
        }
      }

      try {
        if (values.length > 0) {
          await influx.writePoints(values);
        }
        await new Promise((r) => setTimeout(r, sleepTime));
      } catch (e) {
        successful = false;
        console.error(e)
      }
    }
    console.log('thermostat loop failed');
  })(recalcInterval);
})();

const secret = 'toastToastTOAST';
app.set('trust proxy', true);

// parse request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
passport.use(new JwtStrategy(
  // use Authorization: Bearer header from request
  { jwtFromRequest: ExtractJwt.fromAuthHeader(), secretOrKey: secret },
  async function(payload, next) {
    let _id;
    try {
      _id = ObjectID.createFromHexString(payload.id);
    } catch (err) {
      return next(err);
    }
    let user = await mongo.collection('users').findOne({ _id });
    next(null, user || false);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.username);
});
 
passport.deserializeUser(function(username, done) {
  let users = mongo.collection('users');
  users.findOne({ username }, { password: false, _id: false }, done);
});

app.use(passport.initialize());

// routes
app.get('/', function(req, res, next) {
  res.json({ user: req.user, session: req.session, loggedIn: !!req.user });
});

app.route('/login').post(async function(req, res, next) {
  let { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: 'missing username or password', body: req.body });
    return;
  }
  let user = await mongo.collection('users').findOne({ username });
  if (!user) {
    res.status(401).json({ message: 'invalid username' });

  } else if (user.password == password) {
    let payload = { id: user['_id'], username };
    let token = jwt.sign(payload, secret, { expiresIn: '1d' });
    let applications = await getApplications(user);

    res.json({ token, user, applications });

  } else {
    res.status(401).json({ message: 'invalid password' });

  }
})

app.route('/register')
.post(upload.array(), async function(req, res, next) {
  let body = req.body;
  let users = mongo.collection('users');
  let user = body;
  let { username, password } = body;

  if (!username || !password) {
    res.status(400).json({ message: 'missing username or password' });
    return;
  }

  let existing = await users.findOne({ username: user.username });
  if (existing) {
    res.status(409).json({ message: 'username already exists' });
    return;
  }

  try {
    await users.insertOne(user);
  } catch (err) {
    err.status = 400;
    return next(err);
  }
  let payload = { id: user['_id'], username: user.username };
  let token = jwt.sign(payload, secret);

  let applications = await getApplications(user);

  res.json({ token, user, applications });
});
app.delete('/unregister', async function(req, res, next) {
  if (req.user) {
    let users = mongo.collection('users');
    let result;
    try {
      result = await users.findOneAndDelete({ username: req.user.username })
    } catch (err) {
      return next(err);
    }
    if (result.ok) {
      req.logout();
      req.session.destroy((err) => {
        if (err) return next(err);
        res.send();
      });
    } else {
      next(new Error('failed to unregister'));
    }
  } else {
    next(new Error('must be logged in'));
  }
});

app.all('/logout', function(req, res, next) {
  req.logout();
  res.send();
});

// user template, points management
var userRoute = express.Router();

//userRoute.use(ensureLoggedIn('/login'))
userRoute.use(passport.authenticate('jwt', { session: false })); // should replace with call to next on failed auth
userRoute.get('/', function(req, res, next) {
  res.json(req.user);
});

userRoute.get('/applications', async function(req, res, next) {
  let user = await mongo.collection('users').findOne({ _id: req.user['_id'] });
  let applications = await getApplications(user);

  res.json(applications);
});

userRoute.get('/points', async function (req, res, next) {
  let points = await mongo.collection('points').find({}).toArray();
  res.json(points);
});

userRoute.get('/areas', async function (req, res, next) {
  let areas = await mongo.collection('areas').find({}).toArray();
  res.json(areas);
});

const layerOrder = ['building', 'wing', 'department', 'room', 'point'];
// narrow this with bounding box
userRoute.get('/features', async function (req, res, next) {
  let features = await mongo.collection('features').find({}).toArray();
  let layerKeys = await mongo.collection('features').distinct('properties.layer');
  res.json({ features, layers: layerKeys.sort((a, b) => layerOrder.indexOf(a) > layerOrder.indexOf(b) ? 1 : -1).map(key => ({ key, name: key })) });
});

userRoute.get('/features/buildings', async function (req, res, next) {
  let features = await mongo.collection('features').find({ 'properties.layer': 'building' }).toArray();

  let featureCollection = {
    type: 'FeatureCollection',
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
    features
  }

  res.json(featureCollection);
});

userRoute.get('/features/buildings/:building', async function (req, res, next) {
  let buildingName = req.params.building;
  let building = await mongo.collection('buildings').findOne({ shortname: buildingName });
  if (!building) {
    let err = new Error(`no building with that name "${ buildingName }"`);
    err.status = 404;
    next(err);
    return;
  }
  let features = await mongo.collection('features').find({ 'properties.building': building.shortname }).toArray();

  res.json(features);
});

//userRoute.get('/buildings/0/layers/:layerName/features', async function (req, res, next) {
//  let { layerName } = req.params;
//  let features = await mongo.collection('features').find({ 'properties.layer': layerName }).toArray();
//
//  let featureCollection = {
//    type: 'FeatureCollection',
//    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
//    features
//  }
//
//  res.json(featureCollection);
//});

userRoute.get('/points/:id', async function (req, res, next) {
  let { id } = req.params;
  let point = await mongo.collection('points').findOne({ _id: ObjectID.createFromHexString(id) });

  if (point) {
    let value = await influx.query(`SELECT last(value) FROM temperatures WHERE "point" = '${ escape.tag(id) }'`);
    res.json({ value });
    return;
  }

  point = await mongo.collection('areas').findOne({ _id: id });//ObjectID.createFromHexString(id) });
  if (point) {
    let value = await influx.query(`SELECT last(value) FROM temperatures GROUP BY 'area' WHERE "area" = '${ escape.tag(id) }'`);
    res.json({ value });
    return
  }
  let err = new Error('no point with that id found')
  err.status = 404;
  next(err);

});

app.use('/user', userRoute);

app.route('/:name/:id?')
.all(async function(req, res, next) {
  let collections = (await mongo.collections()).map(c => c.collectionName);
  let { name } = req.params;
  next(!collections.includes(name) ? 'route' : undefined);
})
.get(async function(req, res, next) {
  let collection = mongo.collection(req.params.name);
  let { id } = req.params;
  try {
    if (id != null) {
      let doc = await collection.findOne({ _id: ObjectID.createFromHexString(id) });
      res.json(doc);

    } else {
      let docs = await collection.find({}).toArray();
      res.json(docs);
    }
  } catch (err) {
    next(err);
  }
})
.all(function(req, res, next) {
  // check user, user role for further requests
  next()
})
.post(upload.array(), async function(req, res, next) {
  let collection = mongo.collection(req.params.name);
  let body = req.body;
  let result = await mongo.collection(req.params.name).insert(body)
  res.json(result.insertedIds);
})
.put(upload.array(), async function(req, res, next) {
  let collection = mongo.collection(req.params.name);
  let { id } = req.params;
  if (id == null) {
    return next(new Error('must specify id'));
  }
  let body = req.body;
  let result = await collection.findOneAndUpdate({ _id: ObjectID.createFromHexString(id) }, { '$set' : body }, { upsert: false });
  res.json(result);
})
.delete(async function(req, res, next) {
  let collection = mongo.collection(req.params.name);
  let { id } = req.params;
  if (id != null) {
    let result = await collection.findOneAndDelete({ _id: ObjectID.createFromHexString(id) });
    res.json(result);
  } else {
    let result = await collection.remove();
    res.json(result);
  }
});

app.route('/users')
.get(async function(req, res, next) {
  let usersCollection = mongo.collection('users');
  let users = await usersCollection.find({}).toArray();
  res.json(users);
});

app.route('/users/:userId/applications/:appId?')
.get(async function(req, res, next) {
  let { userId, appId } = req.params;
  let users = mongo.collection('users')
  let user = await users.findOne({ _id: ObjectID.createFromHexString(userId) })
  if (!user) return next(new Error('no user with that id'));

  let applications = await getApplications(user);

  res.json(applications);
})
.post(function(req, res, next) {
  next()
});

async function getApplications(user) {
  let ua = user.applications || [];
  let ug = user.groups || [];
  let applications = await expandGroups(ug, ua);
  return applications;
}

async function expandGroups(groupIds, applicationIds=[]) {
  console.log('groups', groupIds);
  let { applications: appIds } = await mongo.collection('groups').aggregate([
    {'$match': { _id: { $in: groupIds/*.map(ObjectID.createFromHexString.bind(ObjectID))*/ }}},
    {'$unwind': '$applications'},
    {'$group': { '_id': null, 'applications': { '$addToSet': '$applications' } }}
  ]).next();
  let applications = await mongo.collection('applications')
    .find({ '_id': { '$in': appIds.concat(applicationIds)/*.map(ObjectID.createFromHexString.bind(ObjectID))*/ }})
    .sort({ '_id': 1 })
    .toArray();
  return applications;
}

// points management

// catch-all error handler
app.use(function(err, req, res, next) {
  //res.status(400)
  res.status(err.status || 500).json({ message: err.message, stack: err.stack });
});

var server = app.listen(3000);
var wss = new WebSocketServer({ server });
var connections = Observable.fromEvent(wss, 'connection', 'data', (ws, req) => ({ ws, req }));

connections.flatMap(({ ws, req }) => {
  let messages = Observable.fromEvent(ws, 'message')
    .pluck('data')
    .flatMap(text => JSON.stringify(text))

  let errors = messages.catch(err => console.error('message parse error') || Observable.never());
  let close = Observable.fromEvent(ws, 'close').take(1);
  let done = Observable.merge(errors, close);

  let responses = messages.takeUntil(done).map(message => {
    return { type: 'received', data: message };
  });

  return responses.flatMap(message => {
    ws.send(JSON.stringify(message));

    return Observable.empty()
  })

}).subscribe();
