import { MongoClient } from 'mongodb';

export default function(cb: Function, config) {
  let { host, databaseName } = config;
  MongoClient.connect(`mongodb://${ host }:27017/${ databaseName }`, cb);
};
