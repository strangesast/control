const http = require('http'),
      WebSocket = require('ws'),
      { Observable, Subject, BehaviorSubject, ReplaySubject } = require('rxjs');

module.exports = function(server, { mongo, influx }) {

  var wss = new WebSocket.Server({ server });
  var connections = Observable.fromEvent(wss, 'connection', 'data', (ws, req) => ({ ws, req }));
  
  connections.flatMap(({ ws, req }) => {
    let messages = Observable.fromEvent(ws, 'message')
      .pluck('data')
      .flatMap(text => JSON.stringify(text))
  
    let errors = messages.catch(err => console.error('message parse error') || Observable.never());
    let close = Observable.fromEvent(ws, 'close').take(1);
    let done = Observable.merge(errors, close);
  
    let responses = messages.takeUntil(done).map(message => {
      return { type: 'received', data: message };
    });
  
    return responses.flatMap(message => {
      ws.send(JSON.stringify(message));
  
      return Observable.empty()
    })
  
  }).subscribe();
  
  server.on('close', function() {
    console.log(`closing socket server`);
    wss.close();
  });
}
