const mongodb = require('mongodb'),
      MongoClient = mongodb.MongoClient,
      Influx = require('influx'),
      { schema } = require('./schema');

module.exports = async function(config) {
  let { host, databaseName } = config;
  let mongo = await MongoClient.connect(`mongodb://${ host }:27017/${ databaseName }`);
  let influx = new Influx.InfluxDB({ host, database: databaseName, schema });
  return { mongo, influx };
};
