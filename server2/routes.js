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

const precision = 10;

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

      let applications = await getApplications(user);
  
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
  
    let applications = await getApplications(user);
  
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
    res.json({ user: req.user });
  });
 
  app.get('/applications', async function(req, res, next) {
    let username = req.user['username'];
    let user = await mongo.collection('users').findOne({ username });
    let applications = await getApplications(user);
    res.json(applications);
  });
  
  // map building / areas / layers
  app.use([
    '/buildings/:id',
    '/buildings/:id/areas',
    '/buildings/:id/layers',
    '/buildings/:id/points'
  ], async function (req, res, next) {
    let { id } = req.params;
    let _id = parseId(id);
    let q = { type: 'building' };
    q[_id ? '_id' : 'shortname'] = _id || id;
    let building = await mongo.collection('areas').findOne(q);
    if (building) {
      req.building = building;
      next();
    } else {
      let err = new Error('no building with that id found');
      err.status = 404;
      next(err);
    }
  });

  app.get('/buildings', async function (req, res, next) {
    let { lat, lon, building: nearBuildingId } = req.query;
    nearBuildingId = parseId(nearBuildingId) || nearBuildingId;
    let nearBuilding;
    if (nearBuildingId) {
      nearBuilding = (await mongo.collection('areas').findOne({ _id: nearBuildingId }))
        || (await mongo.collection('areas').findOne({ shortname: nearBuildingId }));
    }
    let q = { type: 'building' };
    if (lat != null && lon != null) {
      try {
        [lat, lon] = [lat, lon].map(parseFloat);
        q['feature.geometry'] = { $near: { $geometry: { type: "Point", coordinates: [lon, lat] }}};
      } catch (e) {

      }
    } else if (nearBuilding != null) {
      ({ cx: lon, cy: lat } = nearBuilding.feature.properties);
      q['feature.geometry'] = { $near: { $geometry: { type: "Point", coordinates: [lon, lat] }}};
    }
    let buildings = await mongo.collection('areas').find(q).toArray();
    res.json(buildings);
  });

  app.get('/buildings/:id', async function (req, res, next) {
    res.json(req.building);
  });

  app.get('/buildings/:id/areas', async function (req, res, next) {
    let { layer, values } = req.query;
    let q = { building: req.building._id };

    if (values) {
      let results = [];
      let points = await influx.query(`SELECT last("value") FROM "topview"."autogen"."temperatures" WHERE time > now() - 5m GROUP BY "room"`);
      let pointMap = {};
      for (let { time, last, room } of points) {
        pointMap[room] = { time, last };
      }

      let c = mongo.collection('areas');

      let pipeline = [
        // rooms
        { $match: Object.assign({}, q, { type: 'room' }) },
        // add department field
        { $addFields: { 'department': '$parent' }},
        // lookup parent
        { $lookup: { from: 'areas', localField: 'parent', foreignField: '_id', as: '_parent' }}, { $unwind: '$_parent' },
        // add wing field
        { $addFields: { 'wing': '$_parent.parent' }},
        // remove intermediary
        { $project: { '_parent': 0 }},
        //{ $lookup: { from: 'areas', localField: 'department', foreignField: '_id', as: '_department' }},
        //{ $unwind: '$_department' },
        //{ $lookup: { from: 'areas', localField: 'wing', foreignField: '_id', as: '_wing' }},
        //{ $unwind: '$_wing' },
        //{ $lookup: { from: 'areas', localField: 'building', foreignField: '_id', as: '_building' }},
        //{ $unwind: '$_building' },
        //{ $group: { _id: '$parent', children: { $push: '$_id' }}}
      ];

      if (!layer || layer == 'wing') {
        let wings = await c.aggregate(pipeline.concat([
          { $group: { _id: '$wing', children: { $push: '$_id' }}},
          { $lookup: { from: 'areas', localField: '_id', foreignField: '_id', as: 'parent' }},
          { $unwind: '$parent' },
          { $addFields: { 'parent.children': '$children' }},
          { $replaceRoot: { newRoot: '$parent' }},
        ])).toArray();
        results.push(...wings);
      }
      if (!layer || layer == 'department') {
        let departments = await c.aggregate(pipeline.concat([
          { $group: { _id: '$department', children: { $push: '$_id' }}},
          { $lookup: { from: 'areas', localField: '_id', foreignField: '_id', as: 'parent' }},
          { $unwind: '$parent' },
          { $addFields: { 'parent.children': '$children' }},
          { $replaceRoot: { newRoot: '$parent' }},
          { $addFields: { 'wing': '$parent' }}
        ])).toArray();
        results.push(...departments);
      }
      if (!layer || layer == 'room') {
        let rooms = await c.aggregate(pipeline).toArray();
        results.push(...rooms);
      }

      for (let item of results) {
        if (item.type == 'room') {
          item.data = pointMap[item._id];
        } else {
          let vals = item.children.map(id => pointMap[id]);
          let time, last;
          try {
            time = vals.reduce((a, b) => b.time > a ? b.time : a, vals[0].time);
            last = Math.floor(vals.reduce((a, b) => a+b.last, 0)/vals.length*precision)/precision;
          } catch (e) {
            console.log(vals);
            console.log('fuck this, too');
          }
          item.data = { last, time };
          delete item.children;
        }
      }

      res.json(results);

    } else {
      if (layer) {
        q['type'] = layer;
      }
      let areas = await mongo.collection('areas').find(q).toArray();
      res.json(areas);
    }
  });

  app.get('/buildings/:id/layers', async function (req, res, next) {
    let layers = await mongo.collection('areas').distinct('type', { building: req.building._id });
    res.json(layers);
  });

  app.get('/buildings/:id/points', async function (req, res, next) {
    let { value } = req.query;
    let q = { building: req.building._id };
    if (value) q['value'] = value;
    let points = await mongo.collection('points').find(q).toArray();

    res.json(points);
  });
  
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
  
  // catch-all error handler
  app.use(function(err, req, res, next) {
    //res.status(400)
    res.status(err.status || 500).json({ message: err.message, stack: err.stack });
  });

  async function getApplications(user) {
    let applicationIds = user.applications || [];
    let groupIds = user.groups || [];
    if (!Array.isArray(groupIds) || !Array.isArray(applicationIds)) throw new Error('invalid parameters');
    let appIds = groupIds.length ? (await mongo.collection('groups').aggregate([
      {'$match': { _id: { $in: groupIds }}},
      {'$unwind': '$applications'},
      {'$group': { '_id': null, 'applications': { '$addToSet': '$applications' } }}
    ]).next()).applications : [];
    
    let applications = (appIds.length || applicationIds.length) ? (await mongo.collection('applications')
      .find({ '_id': { '$in': appIds.concat(applicationIds) }})
      .sort({ '_id': 1 })
      .toArray()) : [];
    return applications;
  }

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
