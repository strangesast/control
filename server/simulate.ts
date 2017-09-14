import * as path from 'path';
//simulate = require('./simulation'),
//      db = require('./db');
//
//if (require.main === module) {
//  console.log('not here');
//  (async function main() {
//    let config = require('./config')['development'];
//    let dbs = await db(config);
//    let cancel = await simulate(dbs, path.join(__dirname, '../data'))
//
//    process.on('SIGINT', function() {
//      console.log('got signal');
//      cancel();
//      dbs.mongo.close();
//    });
//  })();
//}
