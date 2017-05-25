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

function heartbeat() {
  this.isAlive = true;
}

var connections = [];

var temperature = 0;
var setPoint = 10;

let interval = Observable.interval(500).share();
interval.subscribe((t) => {
  temperature += 2*Math.random()*Math.sign(setPoint-temperature)*Math.pow(Math.abs(setPoint - temperature), 0.5)*0.5
});

interval.delay(100).map(() => Object.keys(sessionValues)).subscribe((ids) => {
  let sessions = Object.keys(activeConnections).filter(id => ids.indexOf(id) > -1);
  sessions.map(session => {
    let ws = activeConnections[session];
    let values = sessionValues[session];
    let ret = {};
    for (let value in values) {
      if (value.indexOf('temp') > -1) {
        ret[value] = temperature;
      } else if (value.indexOf('set') > -1) {
        ret[value] = setPoint;
      } else {
        ret[value] = null;
      }
    }
    ws.map(ws => {
      try {
        ws.send(JSON.stringify({ update: { data: ret }}))
      } catch (e) {
        let found = Object.keys(activeConnections).find(sessionId => activeConnections[sessionId].indexOf(ws) > -1);
        if (found) {
          activeConnections[found].splice(activeConnections[found].indexOf(ws), 1);
        }
      }
    });
  });
});

var activeConnections = {};
var sessionValues = {};

wss.on('connection', function(ws, req) {
  let cookies = cookie.parse(req.headers.cookie);
  let sid = cookies['connect.sid']
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

const keepAliveInterval = setInterval(function() {
  wss.clients.forEach(function(ws) {
    if (ws.isAlive === false) {
      let found = Object.keys(activeConnections).find(sessionId => activeConnections[sessionId].indexOf(ws) > -1);
      if (found) {
        activeConnections[found].splice(activeConnections[found].indexOf(ws), 1);
      }
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping('', false, true);
  });
}, 30000);
