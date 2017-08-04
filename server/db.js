const mongodb = require('mongodb'),
      MongoClient = mongodb.MongoClient;

module.exports = async function(config) {
  let { host, databaseName } = config;
  let mongo = await MongoClient.connect(`mongodb://${ host }:27017/${ databaseName }`);
  return { mongo };
};
