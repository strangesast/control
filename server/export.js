const db = require('./db'),
      path = require('path'),
      fs = require('fs');

if (require.main === module) {
  (async function main() {
    const config = require('./config')['development'];
    let { mongo } = await db(config);
    let basePath = path.join(__dirname);

    let buildings = await mongo.collection('areas').find({}).toArray();
    let features = buildings.map(b => Object.assign(b.feature, { properties: Object.keys(b).filter(k => k!='feature').reduce((a, k) => Object.assign(a, { [k]: b[k] }), {}) }));

    let fc = {
      type: 'FeatureCollection',
      crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
      features
    }
    fs.writeFileSync('out.geojson', JSON.stringify(fc, null, 2));

    mongo.close()
  })();
}
