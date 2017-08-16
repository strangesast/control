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
    await duplicateBuildings(mongo, 2);

    let floors = await mongo.collection('areas').aggregate([
      { $group: { _id: '$floor' }},
      { $lookup: { from: 'areas', localField: '_id', foreignField: '_id', as: 'object' }},
      { $unwind: '$object' }
    ]).toArray();

    // 2 more floors for each of 2 more buildings
    floors.should.have.lengthOf(6);

    let roomIds = await mongo.collection('points').distinct('room');
    let roomCnt = await mongo.collection('areas').count({ type: 'room' });
    roomIds.should.have.lengthOf(roomCnt);

    let buildingsPerFloorShortname = await mongo.collection('areas').aggregate([
        { $match: { type: 'floor' }},
        { $lookup: {
              from: 'areas',
              localField: '_id',
              foreignField: 'floor',
              as: 'values'
            }},
        { $unwind: '$values' },
        { $group: { _id: { shortname: '$shortname', building: '$values.building' }, values: { $push: '$_id' }}},
        { $unwind: '$values' },
        { $group: { _id: '$_id.shortname', values: { $addToSet: '$_id.building' }}},
        { $project: { length: { $size: '$values' }}}
    ]).toArray();

    buildingsPerFloorShortname.should.all.have.property('length', 2);
  });
});
