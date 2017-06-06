var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var RedisStore = require('connect-redis')(session);
var sessionStore = new RedisStore({ host: 'localhost', port: 6379 });
var app = express()
var { Observable, Subject, BehaviorSubject, ReplaySubject } = require('rxjs');

const INIT = require('../templates/list.json');

const secret = 'toastToastTOAST';
app.use(session({
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  store: sessionStore
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var sessionRouter = express.Router();
sessionRouter.get('/', function(req, res, next) {
  res.send();
});

sessionRouter.use(function(req, res, next) {
  if (req.session) {
    return next();
  }
  next(new Error('no session'));
});

sessionRouter.route('/template')
.get(function(req, res, next) {
  console.log('template', req.session.template);
  if (!req.session.template) {
    req.session.template = INIT;
  }
  res.json(req.session.template);
})
.post(upload.array(), function(req, res, next) {
  let body = req.body;
  if (body.template) {
    req.session.template = body;
    res.send();
  }
  let err = new Error('no template');
  err.status = 400;
  next(err);
});

sessionRouter.get('/logout', function(req, res, next) {
  if (req.session) {
    req.session.destroy(function(err) {
      res.send();
    });
  } else {
    res.send();
  }
});


var pointsRouter = express.Router();

pointsRouter.use('/:name', function(req, res, next) {
  let { name } = req.params;
  let template = req.session.template;
  if (!template) {
    next(new Error('no template registered'));
  } else if (name && template.values.hasOwnProperty(name)) {
    next();
  } else {
    next(new Error('invalid name'));
  }
});

pointsRouter.get('/:name', function(req, res, next) {
  // describe
  let template = req.session.template;
  res.json(req.session.template.values[req.params.name]);
});

pointsRouter.route('/:name/current')
.get(function(req, res, next) {
  res.json(measurements[req.params.name]);
})
.post(function(req, res, next) {
  let template = req.session.template;
  let values = template.values;
  let name = req.params.name;
  let body = req.body;

  if (values.hasOwnProperty(name) && values[name].write) {
    if (body.value && !isNaN(body.value)) {
      measurements[name] = { value: body.value, by: id() };
    } else {
      next(new Error('invalid set value'));
    }
  } else {
    next(new Error('point does not exist or you do not have write permission'));
  }
});

pointsRouter.get('/:name/history', function(req, res, next) {
  res.send('toast');
});

sessionRouter.use('/points', pointsRouter);
app.use('/session', sessionRouter);

app.use(function(err, req, res, next) {
  //res.status(400)
  res.status(err.status || 500).json({ error: { message: err.message, stack: err.stack } });
});

// id generator, 9 digits
function id() {
  return ('0'.repeat(9) + Math.floor(Math.random()*1e9)).slice(-9);
}

var server = app.listen(8080)

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ server });

var connections = [];

var measurements = {
  temperature: { value: 0, by: '123123123' },
  setPoint: { value: 10, by: '123123123' }
};
var rates = {
  temperature: 0
}
let interval = Observable.interval(500).share();
interval.subscribe((t) => {
  rates.temperature = ((measurements.setPoint.value - measurements.temperature.value)*Math.random() + rates.temperature)/2;
  measurements.temperature.value += rates.temperature*0.1;
  measurements.temperature.value = Math.floor(measurements.temperature.value*1000)/1000;
  //measurements.temperature.value += 2*Math.random()*Math.sign(measurements.setPoint.value-measurements.temperature.value)*Math.pow(Math.abs(measurements.setPoint.value - measurements.temperature.value), 0.5)*0.5
});

var setSession = Observable.bindNodeCallback(sessionStore.set.bind(sessionStore));
var getSession = Observable.bindNodeCallback(sessionStore.get.bind(sessionStore));

var heartbeatInterval = Observable.interval(10000);
var connectionStream = Observable.fromEvent(wss, 'connection', 'data', (ws, req) => ({ ws, req }));
var groups = connectionStream.flatMap(({ ws, req }) => {
  let headers = req.headers;
  let unparsedCookies = req.headers.cookie;
  let cookies = cookie.parse(req.headers.cookie);
  let connectSid = cookies['connect.sid'];
  let id = cookieParser.signedCookie(connectSid, secret);

  function handleError(message, data = {}) {
    ws.send({ error: { message, data }});
    ws.terminate();
    return Observable.empty();
  }

  return getSession(id).flatMap(session => {
    if (!session) {
      return handleError('expired or invalid session');
    }

    let ping = heartbeatInterval.map(() => ws.ping('', false, true));
    let pong = Observable.fromEvent(ws, 'pong').map(() => true);
    let close = Observable.fromEvent(ws, 'close');
    let hb = Observable.merge(ping, pong).pairwise().filter(([a, b]) => !a && !b);
    let dead = Observable.merge(close, hb);

    let observer = {
      next: (message) => ws.send(JSON.stringify(message)),
      error: console.error.bind(console),
      complete: () => ws.terminate()
    };

    let observable = Observable.fromEvent(ws, 'message')
      .pluck('data')
      .flatMap(text => {
        try {
          return Observable.of(JSON.parse(text));
        } catch (e) {
          return handleError('failed to parse text', text);
        }
      })
      .takeUntil(dead)
      .finally(() => {
        console.log('closed: dead');
        ws.terminate()
      });

    let socket = Subject.create(observer, observable);

    return Observable.of({ id, socket });
  });
});

var updateInterval = Observable.interval(1000).share();
groups.groupBy(({ id }) => id).flatMap((stream) => {
  let id = stream.key;
  return getSession(id).flatMap(session => {
    let clients = [];

    function sendAll(message, except) {
      clients.filter(socket => socket != except).forEach(socket => {
        socket.next(message);
      });
    }

    let currentTemplate = new ReplaySubject();
    if (session.template) {
      currentTemplate.next(session.template);
    }

    currentTemplate.switchMap(template => {
      console.log('current template changed');
      sendAll({ command: { type: 'template', data: template } });

      let values = template.values;

      let valueIds = Object.keys(values); 

      return Observable.interval(1000).map(() => {
        return { values: valueIds.map(id => Object.assign({ name: id }, measurements[id])) };
      });

    }).subscribe(update => sendAll({ update }));

    return stream.flatMap(({ socket }) => {

      console.log('socket');

      clients.push(socket);

      return socket.flatMap(message => {
        let { command, update, error } = message;

        let response = [];
        if (command) {
          let { type, data } = command;

          switch (type) {
            case 'currentTemplate': // request current template
              return getSession(id).map(session => {
                if (session) {
                  let data = session.template || INIT;
                  return { command: { type: 'template', data } };

                } else {
                  return { error: { message: 'expired session' }};
                }
              });

            case 'template': // set template
              return getSession(id).flatMap(session => {
                if (session) {
                  session.template = data;
                  return setSession(id, session).map(result => {

                    console.log('server: got new template');
                    currentTemplate.next(data);

                  });
                } else {
                  return Observable.of({ error: { message: 'expired session' }});
                }
              });
          }

        }

        if (update) {
          console.log('update', update);
        }

        if (error) {

        }

        return Observable.empty();
      }).finally(() => {
        console.log('subject closed');
        clients.splice(clients.indexOf(socket), 1)

      }).map(response => {
        socket.next(response);

      });
    });
  });

}).subscribe();

/*
wss.on('connection', function(ws, req) {
  let cookies = req.headers.cookie && cookie.parse(req.headers.cookie);
  let sid = cookies && cookies['connect.sid']
  let c = sid && cookieParser.signedCookie(sid, secret);
  if (!c) {
    console.log('no session');
    ws.terminate();
    return;
  }
  sessionStore.get(c, function(err, session) {
    if (err || !session) {
      console.log(err ? err : 'no session');
      ws.terminate();
      return;
    }

    activeConnections[c] = activeConnections[c] || [];
    activeConnections[c].push(ws);

    var saveSession = function() {
      return new Promise((resolve, reject) => {
        sessionStore.set(c, session, (err) => {
          if (err) return reject(err); 
          resolve();
        });
      });
    }

    ws.isAlive = true;
    ws.on('pong', heartbeat);
    ws.on('message', async function(message) {
      var json;
      try {
        json = JSON.parse(message);
      } catch (e) {
        ws.send(JSON.stringify({ error: { type: 'invalidJSON', data: message }}));
      }
      let command = json.command;
      if (command) {
        let type = command.type;
        switch (type) {
          case 'template':
            session.template = command.data;
            if (session.template && session.template.values) {
              sessionValues[c] = session.template.values;
            }
            await saveSession();
            ws.send(JSON.stringify({ command: { type: 'templateConfirm' }}));
            break;
          default:
            ws.send(JSON.stringify({ error: { type: 'invalidCommand' }}));
        } 
      } else {
        ws.send(JSON.stringify({ error: { type: 'invalidFormat', data: json }}));
      }
    });

    if (session.template && session.template.values) {
      sessionValues[c] = session.template.values;
    }

    ws.send(JSON.stringify({ command: { type: 'template', data: session.template }}));
  });
});
*/
