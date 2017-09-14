import { MongoClient } from 'mongodb';

var _db = null;

export default async function(config) {
  let { host, databaseName } = config;
  let cs = `mongodb://${ host }:27017/${ databaseName }`
  console.log('cs', cs);
  return _db = await MongoClient.connect(cs);
};

export function connection() {
  return _db;
}
