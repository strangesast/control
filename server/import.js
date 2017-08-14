const fs = require('fs'),
      path = require('path'),
      db = require('./db');

const order = ['building', 'floor', 'wing', 'department', 'room'];

function sortOrder (a, b) { return order.findIndex((o) => a.includes(o)) > order.findIndex((o) => b.includes(o)) ? -1 : 1 };
function ncat (cat) { return `group_${ cat }.geojson` };
function read (f) { return JSON.parse(fs.readFileSync(f)) };

async function importFromGeo(mongo, dir) {
  let collectionNames = (await mongo.listCollections().toArray()).map(c => c.name);
  if (collectionNames.indexOf('areas') > -1) {
    await mongo.collection('areas').drop();
  }
  mongo.collection('areas').ensureIndex({ 'feature.geometry': '2dsphere' });
  mongo.collection('areas').ensureIndex({ shortname: 1 }, { unique: true }); 

  if (collectionNames.indexOf('points') > -1) {
    await mongo.collection('points').drop();
  }
  let parentMap = {};
  let geoFiles = fs.readdirSync(dir).filter(n => n.endsWith('.geojson'));
  let features = geoFiles
    .filter(n => n.includes('group'))
    .sort(sortOrder)
    .map(n => read(path.join(dir, n)))
    .reduce((a, { features }) => a.concat(features), []);

  let findParents = (ids) => features
    .filter(feature => ids.indexOf(feature.properties.parent) > -1);
  
  parents = findParents([null])
  let buildingId;
  let buildingIndex;
  let buildingGamma;
  
  let l = 0;
  // start from root building
  while (l = parents.length) {
    let parentIds = [];
    let docs = [];
    for (let i=0; i < l; i++) {
      let { properties, geometry } = parents[i];
      let { gamma, cx, cy, type, name, shortname, parent, floor } = properties;
      if (type == 'building') {
        if (buildingIndex != null) {
          throw new Error('more than a single building in this import');
        }
        buildingIndex = i;
        buildingGamma = gamma;
      }
      let floorId = parentMap[floor];
      let parentId = parentMap[parent];
      parentIds.push(shortname);

      docs.push({
        type,
        name,
        shortname,
        parent: parentId,
        floor: floorId,
        building: buildingId,
        feature: {
          type: 'Feature',
          geometry,
          properties: { gamma: buildingGamma || gamma, cx, cy }
        }
      });
    }
    let { insertedIds, insertedCount } = await mongo.collection('areas').insertMany(docs);
    if (insertedCount != l) throw new Error('failed to add at least one doc');
    if (!buildingId && buildingIndex != null) {
      buildingId = insertedIds[buildingIndex];
    }
    for (let j=0; j<l; j++) {
      parentMap[parentIds[j]] = insertedIds[j];
    }
    parents = findParents(parentIds);
  }

  let points = geoFiles
    .filter(n => n.includes('points'))
    .map(n => read(path.join(dir, n)))
    .reduce((a, { features }) => a.concat(features), []);

  l = points.length;

  let docs = [];
  let roomsById = (await mongo.collection('areas').find({ 'type': 'room' }).toArray())
    .reduce((a, d) => Object.assign(a, { [d._id]: d }), {});

  let rooms = Object.keys(roomsById).map(id => roomsById[id]);

  // add set points
  for (let { feature, _id: roomId, name } of rooms) {
    let { cx, cy } = feature.properties;
    let k = 0;
    docs.push({
      type: 'point',
      value: 'set_point',
      room: roomId,
      building: buildingId,
      name: `set point device ${ k+1 }`,
      feature: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [cx, cy] }
      }
    });
  }
  // add temperatures
  for (let { geometry, properties } of points) {
    let { name: shortname, room } = properties;
    let roomId = parentMap[room];
    let { name } = roomsById[roomId];
    let k = parseInt(shortname.split('_').slice(-1))
    docs.push({
      type: 'point',
      value: 'temperature',
      room: roomId,
      name: `temperature device ${ k+1 }`,
      building: buildingId,
      feature: {
        type: 'Feature',
        geometry,
        properties: {}
      }
    });
  }
  let { insertedCount } = await mongo.collection('points').insertMany(docs);
  if (insertedCount != l+rooms.length) throw new Error('failed to add at least one doc');
}

async function saveToJSON(mongo) {
  for (let collectionName of ['points', 'areas']) {
    let docs = await mongo.collection(collectionName).find({}).toArray();
    let text = JSON.stringify({ [collectionName]: docs }, null, 2);
    let p = path.join(__dirname, '../data', collectionName + '.json');
    fs.writeFileSync(p, text);
  }
}

if (require.main === module) {
  (async function main() {
    try {
      const config = require('./config')['development'];
      let { mongo } = await db(config);
      let basePath = path.join(__dirname, '../data', 'geo');
      await importFromGeo(mongo, basePath);
      await saveToJSON(mongo);
      mongo.close()
    } catch (e) {
      console.error(e.stack);
    }
  })();
}

module.exports = { importFromGeo, saveToJSON };
