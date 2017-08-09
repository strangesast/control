const db = require('./db');

async function duplicates({ mongo }) {
  let buildings = await mongo.collection('areas').find({ type: 'building' }).toArray();
  
  for (let building of buildings) {
    console.log(building);

  }
}

module.exports = duplicates;

if (require.main === module) {
  (async function main() {
    const config = require('./config')['development'];
    let { mongo } = await db(config);

    await duplicates({ mongo });

    mongo.close();
  })(); 
}
