const fs = require('fs'),
      path = require('path'),
      mongodb = require('mongodb'),
      MongoClient = mongodb.MongoClient,
      ObjectID = mongodb.ObjectID


// get features from '/data/geo'
// create corresponding models
// save feature
// link in model

let dataDir = '../data';
let geoDir = path.join(dataDir, 'geo');

let featureSets = ['areas', 'points']
  .reduce((a, name) => {
    a[name] = JSON.parse(fs.readFileSync(path.join(geoDir, name + '.geojson')));
    return a;
  }, {})


function renameArea(name, id, type) {
  if (type == 'building') {
    return 'Day Automation - Victor Office';
  }
  if (name && name.startsWith('area')) {
    return [name.substr(5), type].map(cap).join(' ');
  }
  if (name && name.startsWith('room')) {
    return `Room ${ parseInt(name.substring(4)) }`
  }
  return `${ cap(type) } ${ id+0 }`
}

(async function() {
  const host = 'localhost';
  const databaseName = 'topview';
  const dbUrl = `mongodb://${ host }:27017/${ databaseName }`;

  mongo = await MongoClient.connect(dbUrl);
  await mongo.dropDatabase();

  let featuresCollection = await mongo.createCollection('features');
  let areasCollection = await mongo.createCollection('areas');
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

      let doc = { type, parent: parentMap[parent], name: nameText };
      let feature  = { geometry, properties: { layer: type }, type: featureType };
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
