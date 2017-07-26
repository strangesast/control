const fs = require('fs'),
      path = require('path'),
      mongodb = require('mongodb'),
      MongoClient = mongodb.MongoClient,
      ObjectID = mongodb.ObjectID


// get features from '/data/geo'
// create corresponding models
// save feature
// link in model

let dataDir = path.join(__dirname, '../data');
let geoDir = path.join(dataDir, 'geo');

let files = fs.readdirSync(geoDir).filter(f => f.endsWith('.geojson'));

let order = ['building', 'wing', 'department', 'room'];
//let features = files.filter(f => f.startsWith('group')).map(f => JSON.parse(fs.readFileSync(path.join(geoDir, f)))).reduce((list, fc) => list.concat(fc.features), []);


const host = 'localhost';
const databaseName = 'topview';
const dbUrl = `mongodb://${ host }:27017/${ databaseName }`;

(async function() {
  let mongo = await MongoClient.connect(dbUrl);
  await mongo.dropDatabase();
  let areasCollection = await mongo.createCollection('areas');
  
  
  let parentMap = {};
  let features = order.map(cat => JSON.parse(fs.readFileSync(path.join(geoDir, `group_${ cat }.geojson`)))).reduce((a, { features }) => a.concat(features), []);
  
  let findParents = (ids) => features
    .filter(feature => ids.indexOf(feature.properties.parent) > -1);
  
  parents = findParents([null])
  
  let l = 0;
  while (l = parents.length) {
    let names = [];
    let docs = [];
    for (let { properties, geometry } of parents) {
      let { gamma, cx, cy, type, name, parent } = properties;
      let feature = { geometry, properties: { gamma, cx, cy }};
      let parentId = parentMap[parent];
      let doc = { type, name: name.split('_').slice(1).join(' '), parent: parentId, feature };
      names.push(name);
      docs.push(doc);
    }
    let { insertedIds, insertedCount } = await areasCollection.insertMany(docs);
    if (insertedCount != l) throw new Error('failed to add at least one doc');
    console.log(insertedCount);
    for (let i=0; i<l; i++) {
      parentMap[names[i]] = insertedIds[i];
    }
  
    parents = findParents(names);
  }

  mongo.close();
})();

/*
(async function() {
  let featuresCollection = await mongo.createCollection('features');
  let pointsCollection = await mongo.createCollection('points');

  let areaFeatures = featureSets.areas.features;
  let oldNameToId = {};
  let parentIds = [null];
  
  let findParents = () => areaFeatures
    .filter(feature => parentIds.indexOf(feature.properties.parent) > -1);
  
  let parentFeatures = findParents();
  let parentMap = {};
  let savedAreas = {};
  
  let l;
  while (l = parentFeatures.length) {
    let parentNames = [];
    let docsToSave = [];
    let featuresToSave = [];

    // move properties from feature to new object
    for (let {
      geometry,
      type: featureType,
      properties: { id, name, parent, type }
    } of parentFeatures) {
      parentNames.push(name || id);
  
      let nameText = renameArea(name, id, type);

      let doc = { type, parent: parentMap[parent], name: nameText, iconPath: `/assets/img/${ name }.png` };
      let feature  = { geometry, properties: { building: buildingShortname, layer: type }, type: featureType };
      docsToSave.push(doc);
      featuresToSave.push(feature);
    }
    parentMap = {};

    let insertedDocIds = await insertInto(areasCollection, docsToSave);
    for (let i=0; i<l; i++) {
      let did = insertedDocIds[i];
      let feature = featuresToSave[i];
      feature.properties['area'] = did;
    }
    let insertedFeatureIds = await insertInto(featuresCollection, featuresToSave);

  
    for (let i=0,pid,id; pid=parentNames[i], id=insertedDocIds[i], i<l; i++) {
      parentMap[pid] = id;
      savedAreas[id] = docsToSave[i];
    }
    Object.assign(oldNameToId, parentMap);
  
    parentIds = Object.keys(parentMap);
    parentFeatures = findParents();
  }

  let pointFeatures = featureSets.points.features;
  let countPerArea = {};

  let docsToSave = [];
  let featuresToSave = [];

  // add features first
  for (let {
    geometry,
    type: featureType,
    properties: { id, parent }} of pointFeatures) {
    let area = oldNameToId[parent];
    let doc = { name: '', area };
    let feature = { geometry, type: featureType, properties: { layer: 'point' } };
    docsToSave.push(doc);
    featuresToSave.push(feature);
    countPerArea[area] = (countPerArea[area] || 0) + 1;
  }

  for (let doc of docsToSave) {
    let areaId = doc.area;
    let areaName = savedAreas[areaId].name;
    doc.name = `${ areaName } Sensor ${ countPerArea[areaId]-- }`;
  }

  l = docsToSave.length;
  let insertedDocIds = await insertInto(pointsCollection, docsToSave);
  
  // add feature reference, update name based on count from that area
  for (let i=0; i<l; i++) {
    let did = insertedDocIds[i];
    let feature = featuresToSave[i];
    feature.properties.point = did;
  }

  let insertedFeatureIds = await insertInto(featuresCollection, featuresToSave);



  for (let collection of [featuresCollection, pointsCollection, areasCollection]) {
    let name = collection.collectionName;
    let docs = await collection.find({}).toArray();
    let text = JSON.stringify({ [name]: docs }, null, 2);
    let p = path.join(dataDir, name + '.json');
    fs.writeFileSync(p, text);
  }

  mongo.close();
})();

function cap(str) {
  return str[0].toUpperCase() + str.substr(1);
}

function saveObject (name, obj) {
  let text = JSON.stringify({ [name] : obj }, null, 2);
  let p = path.join(dataDir, name + '.json');
  fs.writeFileSync(p, text);
}

async function insertInto(collection, docs) {
  let { insertedIds, insertedCount } = await collection.insertMany(docs);
  if (insertedCount != docs.length) throw new Error('failed to add at least one doc');
  return insertedIds;
}
*/
