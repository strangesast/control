const chai = require('chai'),
      chaiThings = require('chai-things'),
      should = chai.should(),
      path = require('path'),
      config = require('../config')['test'];

chai.use(chaiThings)

const expect = chai.expect;

const db = require('../db'),
      simulation = require('../simulation');

describe('simulation', () => {
  it ('should start simulation', async function () {
    this.timeout(6000);
    let { mongo } = await db(config);
    let stop = await simulation({ mongo }, path.join(__dirname, '../../data'), { recalcInterval: 100 });

    // start simulation with same set point across rooms,
    // high variation
    let std = (await mongo.collection('values').aggregate([
      { $match: { measurement: 'temperature' }},
      { $sort: { time: 1 }},
      { $group: { _id: '$point', value: { $last: '$value' }}},
      { $group: { _id: null, value: { $stdDevPop: '$value' }}}
    ]).next()).value;
    expect(std).to.be.above(1);

    let roomCnt = await mongo.collection('areas').find({ type: 'room' }).count();
    let { pntCnt } = await mongo.collection('points').aggregate([
      { $group: { _id: { t: '$value', r: '$room' }}},
      { $count: 'pntCnt' }
    ]).next();

    // expect at least one temp, one set pnt for each room
    expect(pntCnt).to.equal(roomCnt*2);


    await new Promise(r => setTimeout(r, 2000));
    stop();

    // simulation should move temperatures in each room closer to set point
    std = (await mongo.collection('values').aggregate([
      { $match: { measurement: 'temperature' }},
      { $sort: { time: 1 }},
      { $group: { _id: '$point', value: { $last: '$value' }}},
      { $group: { _id: null, value: { $stdDevPop: '$value' }}}
    ]).next()).value;

    expect(std).to.be.below(0.1);
  });
});
