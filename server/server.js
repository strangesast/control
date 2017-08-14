const express = require('express'),
      app = express(),
      path = require('path'),
      bodyParser = require('body-parser'),
      env = app.get('env') || 'development';
      config = require('./config')[env],
      initDatabases = require('./db'),
      routes = require('./routes'),
      sockets = require('./sockets'),
      simulation = require('./simulation'),
      http = require('http');

const port = 3000;
app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

(async function() {
  let dbs = await initDatabases(config);
  routes(app, dbs, config);

  let server = http.createServer(app)

  sockets(server, dbs);

  await dbs.mongo.dropDatabase();
  let cancelSimulation = await simulation(dbs, path.join(__dirname, '../data'));

  server.listen(port, function() {
    console.log(`listening on ${ port }`);
  });

  server.on('close', function() {
    cancelSimulation();
  });

  process.on('SIGINT', function() {
    dbs.mongo.close();
    server.close();
  });

})();

if (env !== 'production') {
  process.on('unhandledRejection', r => console.log(r));
}

module.exports = app;
