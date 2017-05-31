import { Input, Output, EventEmitter, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Http } from '@angular/http';
import { Observer, Subject, Observable, ReplaySubject } from 'rxjs';

var lastMessageId = 0;

@Injectable()
export class RegistrationService implements Resolve<Observable<null>> {
  socket;
  SOCKET_URL = `ws:${ location.origin.substring(location.protocol.length) }/socket`;
  registeredTemplate: Subject<any>;
  updates = new ReplaySubject(1);

  get template() {
    return this.registeredTemplate.take(1)
  }
  set template(template) {
    this.registeredTemplate.next(template);
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
          this.send({ command: { type: 'currentTemplate' }});
          let validCommands = this.socket.filter(message => message.command && message.command.type);

          let templateStream = validCommands.pluck('command')
            .filter(({ type }) => type == 'template')
            .pluck('data')

          let sink = new ReplaySubject(1);
          sink.debounceTime(1000).subscribe(template => {
            this.send({ command: { type: 'template', data: template }});
          });

          this.registeredTemplate = Subject.create(sink, templateStream);

          let updates = this.socket.filter(message => message.update).pluck('update', 'values');
          updates.subscribe(this.updates);
        }
      });
  }

  send(message) {
    this.socket.next(JSON.stringify(message));
  }

  register(attributes) {
    let stream = Observable.combineLatest(...Object.keys(attributes).map(name => {
      let { id, value } = attributes[name];
      let stream = this.updates.pluck(id).filter(v => v != null);
      if (value) stream = stream.startWith(value);
      return stream.distinctUntilChanged().map(v => ({ [name]: v }));
    })).scan((a, b: any[]) => {
      // always returns the last value for each attribute
      return Object.assign(a, b.reduce((c, d) => Object.assign(c, d), {}));
    }, {}).debounceTime(100);

    //let stream = this.updates.pluck(attr.id).filter(v => v != null).distinctUntilChanged();
    let sink = new ReplaySubject(1);
    sink.debounceTime(1000).subscribe(value => {
      console.log('update', value);
      let updates = [];
      for (let prop in value) {
        // check that prop is 'writable'
        updates.push({ name: prop, value: value[prop] });
      }
      console.log(updates);
      this.send({ update: { values: updates }});
    });
    return Subject.create(sink, stream);
  }
}
