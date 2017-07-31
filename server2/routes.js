const mongodb = require('mongodb'),
      ObjectID = mongodb.ObjectID,
      passport = require('passport'),
      jwt = require('jsonwebtoken'),
      JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt,
      Influx = require('influx'),
      { escape } = Influx,
      multer = require('multer'),
      upload = multer();


module.exports = function (app, { mongo, influx }, config) {
  let { secret } = config;

  const params = {
    secretOrKey: secret,
    // use Authorization: Bearer header from request
    jwtFromRequest: ExtractJwt.fromAuthHeader()
  };

  const strategy = new JwtStrategy(params, async function(payload, next) {
    let username = payload.username;
    let user = username && await mongo.collection('users').findOne({ username }, { password: 0 });
    if (user) {
      let { _id, username } = user;
      next(null, { id: _id, username });
    } else {
      let err = new Error('No user found');
      err.status = 401;
      next(err, null);
    }
  });
  passport.use(strategy);
  
  app.use(passport.initialize());
 
  app.route('/login').post(async function(req, res, next) {
    let { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: 'missing username or password' });
      return;
    }
    let user = await mongo.collection('users').findOne({ username });
    if (!user) {
      res.status(401).json({ message: 'invalid username' });
  
    } else if (user.password == password) {
      let payload = { id: user['_id'], username };
      let token = jwt.sign(payload, secret, { expiresIn: '1d' });

      console.log('getting applications...');
      //let applications = await getApplications(user);
      let applications = [];
  
      res.json({ token, user, applications });
  
    } else {
      res.status(401).json({ message: 'invalid password' });
  
    }
  })
  
  app.route('/register').post(upload.array(), async function(req, res, next) {
    let body = req.body;
    let users = mongo.collection('users');
    let user;
    try {
      user = createUser(body);
    } catch (err) {
      return next(err);
    }
    let { username, password } = body;
  
    if (!username || !password) {
      res.status(400).json({ message: 'missing username or password' });
      return;
    }
  
    let existing = await mongo.collection('users').findOne({ username: user.username });
    if (existing) {
      res.status(409).json({ message: 'username already exists' });
      return;
    }

    try {
      await mongo.collection('users').insertOne(user);
    } catch (err) {
      err.status = 400;
      return next(err);
    }
    let payload = { id: user['_id'], username: user.username };
    let token = jwt.sign(payload, secret);
  
    //let applications = await getApplications(user);
    let applications = [];
  
    res.json({ token, user, applications });
  });

  app.delete('/unregister', async function(req, res, next) {
    if (req.user) {
      let result;
      try {
        result = await mongo.collection('users').findOneAndDelete({ username: req.user.username })
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

  app.route('/users')
  .get(async function(req, res, next) {
    //let users = await mongo.collection('users').find({}, { password: 0 }).toArray();
    let users = await mongo.collection('users').find({}).toArray();
    res.json(users);
  });

  // should replace with call to next on failed auth
  app.use(passport.authenticate('jwt', { session: false }));
 
  // routes
  app.get('/', function(req, res, next) {
    res.json({ user: req.user, session: req.session, loggedIn: !!req.user });
  });
 
 
  app.get('/applications', async function(req, res, next) {
    let username = req.user['username'];
    let user = await mongo.collection('users').findOne({ username });
    let applications = await getApplications(user);

    console.log('got apps', applications);
  
    res.json(applications);
  });
  
  app.get('/areas', async function (req, res, next) {
    let areas = await mongo.collection('areas').find({}).toArray();
    res.json(areas);
  });
  
  const layerOrder = ['building', 'wing', 'department', 'room', 'point'];
  // narrow this with bounding box
  app.get('/features', async function (req, res, next) {
    let features = await mongo.collection('features').find({}).toArray();
    let layerKeys = await mongo.collection('features').distinct('properties.layer');
    res.json({ features, layers: layerKeys.sort((a, b) => layerOrder.indexOf(a) > layerOrder.indexOf(b) ? 1 : -1).map(key => ({ key, name: key })) });
  });
  
  app.get('/features/buildings', async function (req, res, next) {
    let features = await mongo.collection('features').find({ 'properties.layer': 'building' }).toArray();
  
    let featureCollection = {
      type: 'FeatureCollection',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      features
    }
  
    res.json(featureCollection);
  });
  
  app.get('/features/buildings/:building', async function (req, res, next) {
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
  
  //app.get('/buildings/0/layers/:layerName/features', async function (req, res, next) {
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
  app.get('/points', async function (req, res, next) {
    let points = await mongo.collection('points').find({}).toArray();
    let values = await influx.query(`SELECT last(value) FROM temperatures GROUP BY point`);
  
    let pointValueMap = values.reduce((a, { last, time, point }) =>
      Object.assign(a, { [point]: { last, time }}), {});
  
    for (let point of points) {
      let id = point._id;
      point.data = pointValueMap[id];
    }
  
    res.json(points);
  });
  
  app.get('/points/:id', async function (req, res, next) {
    let { id } = req.params;
    let _id = parseId(id);
    if (_id) {
      let point = await mongo.collection('points').findOne({ _id });
      console.log('found point');
      console.log(JSON.stringify(point, null, 2));
  
      if (point) {
        let value = await influx.query(`SELECT last(value) FROM temperatures WHERE "point" = '${ escape.tag(id) }'`);
        res.json(value);
        return;
      }
  
      point = await mongo.collection('areas').findOne({ _id: id });
      if (point) {
        let value = await influx.query(`SELECT last(value) FROM temperatures GROUP BY 'area' WHERE "area" = '${ escape.tag(id) }'`);
        res.json({ value });
        return
      }
    }
    let err = new Error('no point with that id found')
    err.status = 404;
    next(err);
  
  });
  
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
    let res = await mongo.collection('groups').aggregate([
      {'$match': { _id: { $in: groupIds/*.map(ObjectID.createFromHexString.bind(ObjectID))*/ }}},
      {'$unwind': '$applications'},
      {'$group': { '_id': null, 'applications': { '$addToSet': '$applications' } }}
    ]).next();
    
    if (res == null) throw new Error('failed to aggregate');
    let { applications: appIds } = res;

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

  // for chaining
  return app;
}

function parseId(string) {
  if (string instanceof ObjectID) return string;
  if (typeof string === 'string'
    && string.length === 24
  ) {
    try {
      return ObjectID.createFromHexString(string);
    } catch (e) {
    }
  }
  return null;
}

function titleCase(string) {
  return string.length ? string[0].toUpperCase() + string.substr(1) : '';
}

function createUser(props) {
  let { username, password, name, groups, applications } = props;
  applications = applications || [];
  if (!Array.isArray(applications)) throw new Error('invalid user: applications type');
  groups = groups || [];
  if (!Array.isArray(groups)) throw new Error('invalid user: applications type');
  name = name || username.split(/\W/).map(titleCase).join(' ');

  return {
    name,
    username,
    password,
    groups,
    applications
  };

}
