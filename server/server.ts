import { createServer } from 'http';
import * as path from 'path';

import app from './app';
import setupRoutes from './routes';
import connectDatabase from './db';
import sockets from './sockets';
import simulation from './simulation';

const env = app.get('env') || 'development',
      config = require('./config')[env];

const server = createServer(app)

const port = 3000;

connectDatabase(function(err, db) {

  let router = setupRoutes(db, config);

  app.use('/api', router);

  server.listen(port, function() {
    console.log(`listening on port ${ port }`);
  });
  
  server.on('close', function() {
    db.close();
  });

  // allow for ctrl-c exit
  process.on('SIGINT', function() {
    server.close();
  });

}, config);

if (env !== 'production') {
  process.on('unhandledRejection', r => console.log(r));
}
