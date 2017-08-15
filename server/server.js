const http = require('http'),
      routes = require('./routes'),
      db = require('./db'),
      sockets = require('./sockets'),
      simulation = require('./simulation'),
      path = require('path');

var app = require('./app');
const env = app.get('env') || 'development',
      config = require('./config')[env];
var server = http.createServer(app)

const port = 3000;

module.exports = db(config).then(async function(dbs) {
  routes(app, dbs, config);
  sockets(server, dbs);

  await dbs.mongo.dropDatabase();
  let cancelSimulation = await simulation(dbs, path.join(__dirname, '../data'));

  server.listen(port, function() {
    console.log(`listening on ${ port }`);
  });

  server.on('close', function() {
    cancelSimulation();
  });

  // allow for ctrl-c exit
  process.on('SIGINT', function() {
    dbs.mongo.close();
    server.close();
  });
});

if (env !== 'production') {
  process.on('unhandledRejection', r => console.log(r));
}
