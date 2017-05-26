var express = require('express');
var session = require('express-session');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var RedisStore = require('connect-redis')(session);
var sessionStore = new RedisStore({ host: 'localhost', port: 6379 });
var app = express()
var { Observable } = require('rxjs');

const secret = 'toastToastTOAST';
app.use(session({
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  store: sessionStore
}));

app.get('/session', function(req, res, next) {
  res.send();
});

app.get('/session/logout', function(req, res, next) {
  if (res.session) {
    req.session.destroy(function(err) {
      res.send();
    });
  } else {
    res.send();
  }
});

var server = app.listen(8080)

var WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ server });

var connections = [];

const INIT = {
  components: {
    root: {
      type: 'ListGroupComponent',
      attributes: [
        {
          name: 'backgroundColor',
          type: 'string',
          value: '#eee'
        },
        { name: 'children', type: 'array', value: [ 'group0', 'group1' ]}
      ]
    },
    group0: {
      type: 'GroupComponent',
      attributes: [
        { name: 'name', type: 'string', value: 'Group 1' },
        { name: 'children', type: 'array', value: [ 'numericInput0', 'numericInput1' ]}
      ]
    },
    group1: {
      type: 'GroupComponent',
      attributes: [
        { name: 'name', type: 'string', value: 'Group 2' },
        { name: 'children', type: 'array', value: ['gaugeComponent0', 'graphComponent0', 'numericInput1'] }
      ]
    },
    numericInput0: {
      type: 'NumericInputComponent',
      attributes: [
        { name: 'label', type: 'string', value: 'Temperature in Room B' },
        { name: 'value', type: 'number', id: 'temperature' },
        { name: 'color', type: 'string', value: 'purple' },
        { name: 'backgroundColor', type: 'string', value: 'white', write: true }
      ]
    },
    numericInput1: {
      type: 'NumericInputComponent',
      attributes: [
        { name: 'label', type: 'string', value: 'Set Point 1' },
        { name: 'value', type: 'number', id: 'setPoint' },
        { name: 'color', type: 'string', value: 'purple' },
        { name: 'backgroundColor', type: 'string', value: 'white' },
        { name: 'write', type: 'boolean', value: true }
      ]
    },
    graphComponent0: {
      type: 'GraphComponent',
      attributes: [
        { name: 'value', type: 'number', id: 'temperature' }
      ]
    },
    gaugeComponent0: {
      type: 'GaugeComponent',
      attributes: [
        { name: 'value', type: 'number', id: 'temperature' }
      ]
    }

  },
  values: {
    temperature: {
      type: 'number',
      name: 'Temperature Monitor 1'
    },
    setPoint: {
      type: 'number',
      name: 'Set Point 1'
    }
  }
}

var measurements = {
  temperature: 0,
  setPoint: 10
};
let interval = Observable.interval(500).share();
interval.subscribe((t) => {
  measurements.temperature += 2*Math.random()*Math.sign(measurements.setPoint-measurements.temperature)*Math.pow(Math.abs(measurements.setPoint - measurements.temperature), 0.5)*0.5
  measurements.temperature = Math.floor(measurements.temperature*1000)/1000;
});

var setSession = Observable.bindNodeCallback(sessionStore.set.bind(sessionStore));
var getSession = Observable.bindNodeCallback(sessionStore.get.bind(sessionStore));

var heartbeatInterval = Observable.interval(10000);
var connectionStream = Observable.fromEvent(wss, 'connection', 'data', (ws, req) => ({ ws, req }));
var groups = connectionStream.flatMap(({ ws, req }) => {
  let cookies = req.headers.cookie && cookie.parse(req.headers.cookie);
  let id = cookies && cookies['connect.sid'] && cookieParser.signedCookie(cookies['connect.sid'], secret);

  let sessionStream = id ? getSession(id) : Observable.of(null);

  let ping = heartbeatInterval.map(() => ws.ping('', false, true));
  let pong = Observable.fromEvent(ws, 'pong').map(() => true);
  let close = Observable.fromEvent(ws, 'close');
  let hb = Observable.merge(ping, pong).pairwise().filter(([a, b]) => !a && !b);
  let dead = Observable.merge(close, hb);
  let messages = Observable.fromEvent(ws, 'message')
    .pluck('data')
    .map(text => JSON.parse(text))
    .takeUntil(dead)
    .finally(() => {
      console.log('closed: dead');
      ws.terminate()
    });

  return sessionStream.map(session => {
    if (session) {
      return { id, session, ws, messages };
    } else {
      console.log('closed: no session');
      ws.terminate();
    }
  });
});

var updateInterval = Observable.interval(1000).share();
groups.groupBy(({ id }) => id).flatMap((stream) => {
  let id = stream.key;
  let clients = [];
  let lastSession;

  function sendAll(message, except) {
    clients.filter(_ws => _ws != except).forEach(_ws => {
      try {
        _ws.send(JSON.stringify(message));
      } catch (e) {

      }
    });
  }

  let values = {};

  return stream.flatMap(({ ws, session, messages }) => {
    let clientIndex = clients.push(ws) - 1;
    lastSession = session;
    let incoming = messages.flatMap(message => {
      let { command, update } = message;
      if (command) {
        let type = command.type;
        switch (type) {
          case 'template':
            // validate template
            let template = command.data;
            lastSession.template = template
            return setSession(id, lastSession).map(() => {
              sendAll({ command: { type: 'template', data: template }});
              values = template.values
            }).catch(err => console.log(err));
          case 'currentTemplate':
            if (lastSession.template == null) {
              lastSession.template = INIT;
            }
            ws.send(JSON.stringify({ command: { type: 'template', data: lastSession.template }}));
            return Observable.empty();
          default:
            return Observable.empty();
        }
      } else if (update) {
        for (let { name, value } of update.values) {
          if (name == 'setPoint') {
            measurements[name] = value;
          }
        }
        return Observable.empty();
      } else {
        return Observable.empty();
      }
    }).finally(() => {
      clients.splice(clients.indexOf(ws), 1)
    });

    let outgoing = updateInterval.map(() => {
      let message = { update: { values: Object.keys(values).filter(val => measurements[val] != null).reduce((a, key) => Object.assign(a, { [key]: measurements[key] }), {}) }};
      ws.send(JSON.stringify(message));
      return message;

    }).catch(() => Observable.empty()).takeUntil(incoming.ignoreElements());

    return outgoing;

    return Observable.merge(incoming, outgoing);
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
