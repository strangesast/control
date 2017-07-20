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

let features = fs.readdirSync(geoDir)
  .map(n => path.join(geoDir, n))
  .filter(p => fs.statSync(p).isFile() && p.endsWith('.geojson'))
  .reduce((a, p) => {
    // like building, wing, sensor, etc
    let type = p.indexOf('sensor') > -1 ? 'sensor' : 'area';
    let category;
    if (type == 'area') {
      category = p.substring(p.lastIndexOf('/')+1, p.lastIndexOf('.geojson')).slice(0, -1);
    }

    let features = JSON.parse(fs.readFileSync(p)).features;
    for (let feature of features) {
      Object.assign(feature.properties, { category, type });
    };

    a[type] = (a[type] || []).concat(features);
    return a;
  }, {});

function cap(str) {
  return str[0].toUpperCase() + str.substr(1);
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

  let oldAreaNameToId = {};

  let parentMap = { [null]: null };
  let parentIds = [null];
  let prevParentNames = [];
  let parentFeatures = features.area.filter(feature =>
    parentIds.indexOf(feature.properties.parent) > -1
  );

  let inserted = 0;
  let areaFeatures = {};
  while (parentFeatures.length) {
    let parentNames = [];

    for (let feature of parentFeatures) {
      let { name, parent, category, type } = feature.properties;
      parentNames.push(name);

      let nameText = category == 'room' ? `Room ${ parseInt(name.slice(-3)) }` :
          category == 'building' ? 'Day Automation - Victor Office' :
          `${ cap(name.substr(5)) } ${ cap(category) }`;

      feature.properties = {
        category,
        type,
        parent: parentMap[parent],
        name: nameText
      };
    }
    parentMap = {};

    let l = parentFeatures.length;
    let areas = parentFeatures.map(feature => feature.properties);
    let justFeatures = parentFeatures.map(({ geometry, type }) => ({ geometry, type, properties: {} }))

    let insertedFeatureIds = await insertInto(featuresCollection, justFeatures);
    for (let i=0; i<l; i++) {
      areas[i].feature = insertedFeatureIds[i];
    }

    let insertedAreaIds = await insertInto(areasCollection, areas);
    inserted += l

    for (let i=0,pid,id; pid=parentNames[i], id=insertedAreaIds[i], i<l; i++) {
      parentMap[pid] = id;
      areaFeatures[id] = parentFeatures[i];
    }
    Object.assign(oldAreaNameToId, parentMap);

    prevParentNames = prevParentNames.concat(parentNames);
    parentIds = Object.keys(parentMap);
    parentFeatures = features.area.filter(feature =>
      parentIds.indexOf(feature.properties.parent) > -1
    );
  }

  let countPerArea = {};
  for (let feature of features.sensor) {
    let { area } = feature.properties;
    let areaId = oldAreaNameToId[area];
    if (areaId == null) throw new Error('sensor with unknown area');
    countPerArea[areaId] = (countPerArea[areaId] || 0) + 1;
  }

  for(let feature of features.sensor) {
    let { area: oldAreaName } = feature.properties;
    let areaId = oldAreaNameToId[oldAreaName];
    let area = areaFeatures[areaId];
    let name = `${ area.properties.name } Sensor ${ countPerArea[areaId]-- }`;
    feature.properties = { name, area: areaId };
  }

  let points = features.sensor.map(feature => feature.properties);
  let l = points.length;
  let justFeatures = features.sensor.map(({ geometry, type }) => ({ geometry, type, properties: {} }));

  let insertedFeatureIds = await insertInto(featuresCollection, justFeatures);
  for (let i=0; i<l; i++) {
    points[i].feature = insertedFeatureIds[i];
  }
  await insertInto(pointsCollection, points);


  for (let collection of [featuresCollection, pointsCollection, areasCollection]) {
    let name = collection.collectionName;
    let docs = await collection.find({}).toArray();
    let text = JSON.stringify({ [name]: docs }, null, 2);
    let p = path.join(dataDir, name + '.json');
    fs.writeFileSync(p, text);
  }

  mongo.close();

})();

async function insertInto(collection, docs) {
  let { insertedIds, insertedCount } = await collection.insertMany(docs);
  if (insertedCount != docs.length) throw new Error('failed to add at least one doc');
  return insertedIds;
}
