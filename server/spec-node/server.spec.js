const fs = require('fs');
const chai = require('chai'),
      chaiHttp = require('chai-http'),
      chaiThings = require('chai-things'),
      server = require('../server'),
      should = chai.should();

chai.use(chaiThings)
chai.use(chaiHttp)
const expect = chai.expect;

describe('server', async () => {
  let token, user, building, cx, cy;
  it ('should create user, use token to authenticate further requests', async () => {
    let res = await chai.request(server)
      .post('/register')
      .field('username', 'test')
      .field('password', 'test');

    res.should.have.status(200);
    res.body.should.have.property('token');
    res.body.should.have.property('user');

    ({ token, user } = res.body);

    // need to wait for server to initialize, shitty
    await new Promise(r => setTimeout(r, 1000));

    try {
      // eeeehhhh
      res = await chai.request(server).get('/');

    } catch ({ response }) {
      response.should.have.status(401);
    }

    res = await chai.request(server)
      .get('/')
      .set('Authorization', 'JWT ' + token);

    res.body.should.have.property('user');
  });

  it ('should get all buildings', async () => {
    let res = await chai.request(server).get('/buildings')
      .set('Authorization', 'JWT ' + token);
    expect(res.body).to.be.an('array')
    building = res.body[0];
    expect(building).to.have.property('_id');
    expect(building).to.have.property('feature');
    ({ cx, cy } = building.feature.properties);
  });

  it ('should get geo near', async () => {
    // test geo near
    let res = await chai.request(server)
      .get('/buildings')
      .query({ lat: cy, lon: cx })
      .set('Authorization', 'JWT ' + token);
    expect(res.body).to.be.an('array');
    expect(res.body).to.have.lengthOf(1);
  });

  it ('should get buildings near id', async () => {
    let res = await chai.request(server)
      .get('/buildings')
      .query({ building: building._id })
      .set('Authorization', 'JWT ' + token);
    expect(res.body).to.be.an('array');
    expect(res.body).to.have.lengthOf(1);
  });

  it ('should get buildings near shortname', async () => {
    let res = await chai.request(server)
      .get('/buildings')
      .query({ building: building.shortname })
      .set('Authorization', 'JWT ' + token);
    expect(res.body).to.be.an('array');
    expect(res.body).to.have.lengthOf(1);
  });
  
  it ('should get building by shortname', async () => {
    let res = await chai.request(server)
      .get(`/buildings/${ encodeURIComponent(building.shortname) }`)
      .set('Authorization', 'JWT ' + token);
    expect(res.body).to.deep.equal(building);
  });

  it ('should get building by id', async () => {
    let res = await chai.request(server)
      .get(`/buildings/${ encodeURIComponent(building._id) }`)
      .set('Authorization', 'JWT ' + token);
    res.body.should.deep.equal(building);
  });

  it ('should get building areas', async () => {
    let res = await chai.request(server)
      .get(`/buildings/${ encodeURIComponent(building._id) }/areas`)
      .set('Authorization', 'JWT ' + token);
    res.body.should.be.an('array');
  });

  it ('should get building layers', async () => {
    let res = await chai.request(server)
      .get(`/buildings/${ encodeURIComponent(building._id) }/layers`)
      .set('Authorization', 'JWT ' + token);
    res.body.should.be.an('array');
    expect(new Set(res.body)).to.deep.equal(new Set(['room', 'wing', 'department']));
  });

  it ('should get subset of building areas by layer',  async () => {
    let res = await chai.request(server)
      .get(`/buildings/${ encodeURIComponent(building._id) }/areas`)
      .query({ layer: 'department' })
      .set('Authorization', 'JWT ' + token);
    expect(res.body).to.be.an('array');
    res.body.should.all.have.property('type', 'department');
  });

  it ('should get a set point for each room in building', async () => {
    let res = await chai.request(server)
      .get(`/buildings/${ encodeURIComponent(building._id) }/areas`)
      .query({ layer: 'room' })
      .set('Authorization', 'JWT ' + token);
    res.body.should.be.an('array');
    let rooms = res.body;

    res = await chai.request(server)
      .get(`/buildings/${ encodeURIComponent(building._id) }/points`)
      .query({ value: 'set_point' })
      .set('Authorization', 'JWT ' + token);
    res.body.should.all.have.property('value', 'set_point');
    let set_points = res.body;
    rooms.length.should.equal(set_points.length);

    res = await chai.request(server)
      .get(`/buildings/${ encodeURIComponent(building._id) }/points`)
      .query({ value: 'temperature' })
      .set('Authorization', 'JWT ' + token);
    res.body.should.all.have.property('value', 'temperature');
    let temp_points = res.body;
    temp_points.should.have.lengthOf.at.least(set_points.length);
  });

  it ('should get areas and last temperatures', async () => {
    let res = await chai.request(server)
      .get(`/buildings/${ encodeURIComponent(building._id) }/areas`)
      .query({ values: true })
      .set('Authorization', 'JWT ' + token);

    res.body.should.all.have.property('data');
  });

  it ('should get a point for each area', async () => {
    let res = await chai.request(server)
      .get(`/points`)
      .set('Authorization', 'JWT ' + token);

    let tempPoint = res.body.find(t => t.value == 'temperature');
    let spPoint = res.body.find(t => t.value == 'set_point');

    res = await chai.request(server)
      .get(`/points/${ tempPoint._id }`)
      .set('Authorization', 'JWT ' + token);

    res.body.should.have.property('history');
  });
});
