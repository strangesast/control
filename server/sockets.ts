import * as http from 'http';
import { Server as WebsocketServer } from 'ws';
import { Observable, Subject, BehaviorSubject, ReplaySubject } from 'rxjs';

export default function(server, mongo) {

  var wss = new WebsocketServer({ server });
  var connections = Observable.fromEvent(wss, 'connection', 'data' as any, (ws, req) => ({ ws, req }));
  
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
