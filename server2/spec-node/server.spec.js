const chai = require('chai'),
      chaiHttp = require('chai-http'),
      server = require('../server'),
      should = chai.should();

chai.use(chaiHttp);

describe('server', async () => {
  it ('should create user', (done) => {
    chai.request(server)
      .post('/register')
      .field('username', 'test')
      .field('password', 'test')
      .end((err, res) => {
        console.log('err', Object.keys(err));
        res.should.have.status(200);

        done()
      });
  });
});
