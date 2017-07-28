const chai = require('chai'),
      chaiHttp = require('chai-http'),
      server = require('../server'),
      should = chai.should();

chai.use(chaiHttp);

describe('server', async () => {
  it ('should create user', async () => {
    let res = await chai.request(server)
      .post('/register')
      .field('username', 'test')
      .field('password', 'test');

    res.should.have.status(200);
    res.body.should.have.property('token');
    res.body.should.have.property('user');

    let { token, user } = res.body;


    try {
      // eeeehhhh
      res = await chai.request(server).get('/');

    } catch ({ response }) {
      response.should.have.status(401);
    }

    res = await chai.request(server).get('/').set('Authorization', 'JWT ' + token);

    res.body.should.have.property('user');
  });
});
