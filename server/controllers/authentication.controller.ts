import * as jwt from 'jsonwebtoken';
import { ObjectID } from 'mongodb';
import { connection } from '../db';

const mongo = connection();

const env = process.env.NODE_ENV || 'testing';
import config from '../config';
const secret = config[env].secret;

const layerOrder = ['building', 'floor', 'wing', 'department', 'room', 'point'];
const floorOrder = ['basement', 'ground', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

export async function getApplications(user) {
  let applicationIds = user.applications || [];
  let groupIds = user.groups || [];
  if (!Array.isArray(groupIds) || !Array.isArray(applicationIds)) throw new Error('invalid parameters'); let appIds = groupIds.length ? (await mongo.collection('groups').aggregate([
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

export async function loginUser (req, res, next) {
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
}

export async function registerUser(req, res, next) {
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
}

export async function deleteUser(req, res, next) {
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
}

export function logoutUser(req, res, next) {
  req.logout();
  res.send();
}

export function emptyResponse(req, res, next) {
  res.send();
}

export async function listUsers(req, res, next) {
  //let users = await mongo.collection('users').find({}, { password: 0 }).toArray();
  let users = await mongo.collection('users').find({}).toArray();
  res.json(users);
}

export async function returnUser(req, res, next) {
  res.json({ user: req.user });
}

export async function listUserApplications(req, res, next) {
  let username = req.user['username'];
  let user = await mongo.collection('users').findOne({ username });
  let applications = await getApplications(user);
  res.json(applications);
}

export async function addBuildingToReq(req, res, next) {
  let { building: id } = req.params;
  let _id = parseId(id);
  let q = { type: 'building' };
  q[_id ? '_id' : 'shortname'] = _id || id;
  let building = await mongo.collection('areas').findOne(q);
  if (building) {
    await addBuildingData(building);
    req.building = building;
    next();

  } else {
    let err: any = new Error('no building with that id found');
    err.status = 404;
    next(err);
  }
}

export async function returnBuilding(req, res, next) {
  res.json(req.building);
}

export async function listBuildings (req, res, next) {
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

  let buildings = await mongo.collection('areas').find(q).sort({ _id: 1 }).toArray();
  await addBuildingData(buildings);

  res.json(buildings);
}

export async function listBuildingAreas(req, res, next) {
  let { floor, layer, values } = req.query;
  let buildingId = req.building._id;
  // handle floor id, shortname
  if (floor) {
    floor = await parseIdOrShortname(floor, buildingId, 'areas');
  }
  values = (values == undefined || values == 'true' || values == '1') ? true : false;
  let q: any = {};
  if (layer) q.type = layer;
  if (floor) q.floor = floor;

  // will need this for areas without descendant points
  //let areas = await mongo.collection('areas').find(q).toArray();

  // get the latest value for each point for each area for building
  let pipeline = [
    { $match: { building: buildingId }},
    ...areaValuesPipeline,
    { $match: Object.assign({ building: buildingId }, q) },
    { $sort: { _id: 1 }}
  ];

  let areas = await mongo.collection('areas').find(Object.assign({ building: buildingId}, q)).sort({ _id: 1 }).toArray();
  if (values) {
    let valueMap = (await mongo.collection('values').aggregate(pipeline, { allowDiskUse: true }).toArray()).reduce(function(a, b) {
      a[b._id.toString()] = valuesToDataMap(b.values);
      return a;
    }, {});
    for (let area of areas) {
      area.data = valueMap[area._id.toString()] || {};
    }
  }
  res.json(areas);
}

export async function listDistinctBuildingLayers(req, res, next) {
  let layers = await mongo.collection('areas').distinct('type', { building: req.building._id });
  res.json(layers);
}

export async function listBuildingFloors(req, res, next) {
  let buildingId = req.building._id;
  let floors = (await mongo.collection('areas').find({ building: buildingId, type: 'floor' }, { shortname: 1 }).toArray()).map(a => a._id);
  res.json(floors);
}

export async function listBuildingPoints (req, res, next) {
  let { value } = req.query;
  let q = { building: req.building._id };
  if (value) q['value'] = value;
  let points = await mongo.collection('points').find(q).toArray();

  res.json(points);
}

export async function returnBuildingArea (req, res, next) {
  let buildingId = req.building._id;
  let { id } = req.params;
  let _id = await parseIdOrShortname(id, buildingId, 'areas');
  let q = { building: buildingId, _id };

  let area = await mongo.collection('areas').findOne(q);

  res.json(area);

}

export async function returnBuildingPoint (req, res, next) {
  let buildingId = req.building._id;
  let { id } = req.params;
  let _id  = await parseIdOrShortname(id, buildingId, 'points');
  let q = { building: buildingId, _id };
  let point = await mongo.collection('points').findOne(q);

  let history = await mongo.collection('values').aggregate([
    { $match: { point: point._id }},
    { $sort: { time: -1 }},
    { $project: { _id: 0, time: 1, value: 1 }}
  ], { allowDiskUse: true }).toArray();

  point.data = history[0];
  point.history = history;

  res.json(point);
}

export async function listPoints (req, res, next) {
  let { measurement } = req.query;
  let q: any = {};

  let pipeline: any[] = [
    { $sort: { time: 1 }},
    { $group: { _id: '$point', value: { $last: '$$ROOT' }}},
    { $project: { 'value._id': 1, 'value.time': 1, 'value.value': 1 }},
    { $lookup: { from: 'points', localField: '_id', foreignField: '_id', as: 'point' }},
    { $unwind: '$point' },
    { $addFields: { 'point.data': '$value' }},
    { $replaceRoot: { newRoot: '$point' }}
  ];

  if (measurement) q.measurement = measurement;

  if (Object.keys(q).length > 0) {
    pipeline.unshift({ $match: q });
  }

  let points = await mongo.collection('values').aggregate(pipeline, { allowDiskUse: true }).toArray();

  res.json(points);
}

export async function returnPoint (req, res, next) {
  let { id } = req.params;
  let _id = parseId(id)
  if (_id == null) throw new Error('invalid id');
  let point = await mongo.collection('points').findOne({ _id });

  let history = await mongo.collection('values').aggregate([
    { $match: { point: _id }},
    { $sort: { time: -1 }},
    { $project: { _id: 0, time: 1, value: 1 }}
  ], { allowDiskUse: true }).toArray();

  point.data = history[0];
  point.history = history;

  res.json(point);
}

export async function handleRoutedError(err, req, res, next) {
  res.status(err.status || 500).json({ message: err.message, stack: err.stack });
}

async function addBuildingData(buildings) {
  let pipeline: any[] = [
    // get last value for each point
    { $sort: { time: -1 }},
    { $group: { _id: '$point', value: { $first: '$$ROOT' }}},
    { $replaceRoot: { newRoot: '$value' }},
    // use point building, measurement info
    { $lookup: {
      from: 'points',
      localField: 'point',
      foreignField: '_id',
      as: 'point'
    }},
    { $unwind: '$point' },
    // get avg for each measurement, building combination
    { $group: { _id: { building: '$point.building', measurement: '$point.value' }, last: { $avg: '$value' }, time: { $first: '$time' }}},
    // add unique measurements to array
    { $group: { _id: '$_id.building', values: { $push: { last: '$last', time: '$time', measurement: '$_id.measurement' }}}}
  ];

  if (!Array.isArray(buildings)) {
    pipeline.push({ $match: { _id: buildings._id }});
    buildings = [buildings];
  }

  let valueMap = (await mongo.collection('values').aggregate(pipeline, { allowDiskUse: true }).toArray()).reduce(function(a, { _id, values }) {
    a[_id.toString()] = valuesToDataMap(values);
    return a;
  }, {});

  let fn = (a, { _id, values }) => Object.assign(a, { [_id.toString()]: values });
  let floorsByBuilding = (await mongo.collection('areas').aggregate([
      { $group: { _id: { type: '$floor', building: '$building' }}},
      { $match: { '_id.building': { $ne: null }, '_id.type': { $ne: null }}},
      { $lookup: { from: 'areas', localField: '_id.type', foreignField: '_id', as: 'value' }},
      { $unwind: '$value' },
      { $group: { _id: '$_id.building', values: { $push: { shortname: '$value.shortname', _id: '$value._id' }}}}
  ]).toArray()).reduce(fn, {});
  let layersByBuilding = (await mongo.collection('areas').aggregate([
      { $group: { _id: { type: '$type', building: '$building' }}},
      { $match: { '_id.building': { $ne: null }, '_id.type': { $ne: null }}},
      { $group: { _id: '$_id.building', values: { $push: '$_id.type' }}}
  ]).toArray()).reduce(fn, {});

  for (let b of buildings) {
    let id = b._id.toString();
    b.data = valueMap[id] || {};
    b.floors = floorsByBuilding[id].sort((a, b) => {
      let i = floorOrder.findIndex(f => a.shortname.includes(f));
      let j = floorOrder.findIndex(f => b.shortname.includes(f));
      return i > j ? 1 : i < j ? -1 : 0;
    }).map(f => f._id);
    b.layers = layersByBuilding[id].sort((a, b) => {
      let i = layerOrder.indexOf(a);
      let j = layerOrder.indexOf(b);
      return i > j ? 1 : i < j ? -1 : 0;
    });
  }

  return buildings;
}


async function parseIdOrShortname(string, buildingId, collection) {
  let id = parseId(string);
  if (id) return id;
  if (typeof collection !== 'string') throw new Error('need collection!');
  return ((await mongo.collection(collection).findOne({ building: buildingId, shortname: string })) || {})._id;
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

function sortById (a, b) {
  return a._id > b._id ? 1 : b._id > a._id ? -1 : 0;
}

function valuesToDataMap (values) {
  return values.reduce((a, { measurement, time, last }) => Object.assign(a, { [measurement]: last }), {});
}

const pointValuesPipeline = [
  // get latest point values
  { $sort: { time: -1 }},
  { $group: { _id: '$point', value: { $first: { time: '$time', value: '$value'}}}},
  // get point for each latest value
  { $lookup: { from: 'points', localField: '_id', foreignField: '_id', as: 'point' }},
  { $unwind: '$point' },
  { $addFields: { 'point.last': '$value' }},
  { $replaceRoot: { newRoot: '$point' }}
];

const areaValuesPipeline = [
  ...pointValuesPipeline,
  { $addFields: { parent: '$room' }},
  // find ancestors of each point
  { $graphLookup: {
    from: 'areas',
    startWith: '$parent',
    connectFromField: 'parent',
    connectToField: '_id',
    as: 'hierarchy'
  }},
  // duplicate point for each ancestor
  { $unwind: '$hierarchy' },
  { $sort: { 'last.time': -1 }}, // may be unnecessary
  // group by ancestor, value.measurement for avg value, last time
  { $group: {
    _id: { parent: '$hierarchy._id', measurement: '$value' },
    hierarchy: { $first: '$hierarchy' },
    last: { $avg: '$last.value' },
    time: { $first: '$last.time' }
  }},
  // group by ancestor
  { $group: {
    _id: '$_id.parent',
    hierarchy: { $first: '$hierarchy' },
    lasts: { $push: { measurement: '$_id.measurement', last: '$last', time: '$time' }}
  }},
  // cleanup
  { $addFields: {'hierarchy.values': '$lasts' }},
  { $replaceRoot: { newRoot: '$hierarchy' }}
];
