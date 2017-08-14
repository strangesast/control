const chai = require('chai'),
      chaiThings = require('chai-things'),
      should = chai.should(),
      path = require('path'),
      config = require('../config')['test'];

chai.use(chaiThings)

const expect = chai.expect;

const db = require('../db'),
      { duplicateFloors, duplicateBuildings } = require('../duplicates'),
      { importFromGeo } = require('../import');


describe('duplicates', async () => {
  it ('should copy buildings and floors n times', async () => {
    let { mongo } = await db(config);

    await importFromGeo(mongo, path.join(__dirname, '../../data/geo'));
    await duplicateFloors(mongo, 2);

    let floors = await mongo.collection('areas').aggregate([
      { $group: { _id: '$floor' }},
      { $lookup: { from: 'areas', localField: '_id', foreignField: '_id', as: 'object' }},
      { $unwind: '$object' }
    ]).toArray();

    expect(floors).to.have.lengthOf(3);

    let roomIds = await mongo.collection('points').distinct('room');
    let roomCnt = await mongo.collection('areas').count({ type: 'room' });
    expect(roomIds).to.have.lengthOf(roomCnt);
  });
});
