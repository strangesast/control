const fs = require('fs'),
      path = require('path'),
      mongodb = require('mongodb'),
      MongoClient = mongodb.MongoClient,
      ObjectID = mongodb.ObjectID,
      db = require('./db');

const order = ['building', 'wing', 'department', 'room'];

function sortOrder (a, b) { return order.findIndex((o) => a.includes(o)) > order.findIndex((o) => b.includes(o)) ? -1 : 1 };
function ncat (cat) { return `group_${ cat }.geojson` };
function read (f) { return JSON.parse(fs.readFileSync(f)) };

async function importFromGeo(mongo, dir) {
  let collectionNames = (await mongo.listCollections().toArray()).map(c => c.name);
  if (collectionNames.indexOf('areas') > -1) {
    await mongo.collection('areas').drop();
  }

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
  
  let l = 0;
  while (l = parents.length) {
    let parentIds = [];
    let docs = [];
    for (let { properties, geometry } of parents) {
      let { gamma, cx, cy, type, name, shortname, parent } = properties;
      let feature = { type: 'Feature', geometry, properties: { gamma, cx, cy }};
      let parentId = parentMap[parent];
      let doc = { type, name, parent: parentId, feature };
      parentIds.push(shortname);
      docs.push(doc);
    }
    let { insertedIds, insertedCount } = await mongo.collection('areas').insertMany(docs);
    if (insertedCount != l) throw new Error('failed to add at least one doc');
    for (let i=0; i<l; i++) {
      parentMap[parentIds[i]] = insertedIds[i];
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

  for (let { geometry, properties } of points) {
    let { name, room } = properties;
    let feature = { type: 'Feature', geometry, properties: {}};
    let parentId = parentMap[room];
    let parent = roomsById[parentId];
    let i = parseInt(name.split('_').slice(-1))
    let doc = { type: 'point', room: parentId, name: `${ parent.name } sensor ${ i+1 }`, feature };
    docs.push(doc);
  }
  let { insertedCount } = await mongo.collection('points').insertMany(docs);
  if (insertedCount != l) throw new Error('failed to add at least one doc');
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
    const config = require('./config')['development'];
    let { mongo } = await db(config);
    let basePath = path.join(__dirname, '../data', 'geo');
    await importFromGeo(mongo, basePath);
    await saveToJSON(mongo);
  
    mongo.close()
  })();
}

module.exports = { importFromGeo, saveToJSON };
