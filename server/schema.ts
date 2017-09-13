const Influx = require('influx');
const { FLOAT, STRING, INTEGER } = Influx.FieldType;

const schema = [
  {
    measurement: 'temperatures',
    fields: {
      value: FLOAT
    },
    tags: [
      // id from mongo
      'point',
      'room'
    ]
  },
  {
    measurement: 'setpoints',
    fields: {
      value: FLOAT,
      by: STRING, // who set it
      nonce: STRING // used to determine if request was carried out
    },
    tags: ['room'] // for now set points are attached to areas
  }
];

module.exports.schema = schema;
