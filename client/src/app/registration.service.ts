import { Input, Output, EventEmitter, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Http } from '@angular/http';
import { Observer, Subject, Observable, ReplaySubject } from 'rxjs';

var lastMessageId = 0;

@Injectable()
export class RegistrationService implements Resolve<Observable<null>> {
  socket;
  SOCKET_URL = `ws:${ location.origin.substring(location.protocol.length) }/socket`;
  registeredTemplate = new ReplaySubject(1);
  updates = new ReplaySubject(1);

  get template() {
    return this.registeredTemplate.take(1)
  }
  set template(template) {
    this.send({ command: { type: 'template', data: template }});
  }

  constructor(private http: Http) { }

  resolve() {
    return this.init()
  }

  init() {
    return this.http.get(`${ location.origin }/socket/session`)
      .map((res) => {
        if (res.status === 200) {
          this.socket = Observable.webSocket(this.SOCKET_URL)
          let validCommands = this.socket.filter(message => message.command && message.command.type);
          validCommands.pluck('command')
            .filter(({ type }) => type == 'template')
            .pluck('data')
            .subscribe(this.registeredTemplate);

          let updates = this.socket.filter(message => message.update).pluck('update', 'values');
          updates.subscribe(this.updates);
        }
      });
  }

  send(message) {
    this.socket.next(JSON.stringify(message));
  }

  register(attr) {
    let stream = this.updates.pluck(attr.id).filter(v => v != null);
    if (attr.value != null) stream = stream.startWith(attr.value);
    let sink = new ReplaySubject(1);
    sink.throttleTime(100).subscribe(value => {
      this.send({ update: { values: [ { name: attr.id, value } ]}});
    });
    return Subject.create(sink, stream);
  }
}
