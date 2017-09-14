import { createServer } from 'http';
import * as path from 'path';

import app from './app';
import routes from './routes';
import connect from './db';
import sockets from './sockets';
//import simulation from './simulation';

import config from './config';
const env = app.get('env') || 'development';

const server = createServer(app)

const port = 3000;

(async function() {

  await connect(config[env]);

  app.use('/api', routes);

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

})();

if (env !== 'production') {
  process.on('unhandledRejection', r => console.log(r));
}
