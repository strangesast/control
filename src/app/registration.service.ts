import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

var lastMessageId = 0;

@Injectable()
export class RegistrationService {
  socket;
  commands;
  templateMessages;
  SOCKET_URL = `ws:${ location.origin.substring(location.protocol.length) }/socket`;

  constructor(private http: Http) { }

  init() {
    return this.http.get(`${ location.origin }/socket/session`).flatMap(res => {
      this.socket = Observable.webSocket(this.SOCKET_URL);
      this.commands = this.socket.filter(message => message.command && typeof message.command.type === 'string').pluck('command');
      this.templateMessages = this.commands.filter(({ type }) => type.startsWith('template'));

      return this.templateMessages.take(1).map(message => {
        console.log('message', message);
        let template = message.data;

        return template;
      });
    });
  }

  register(config) {
    let id = lastMessageId++
    this.socket.next(JSON.stringify({ command: { type: 'template', data: config, id }}));
    return this.templateMessages.filter(message => message.type === 'templateConfirm').take(1).subscribe(val => {
      console.log('val', val);
    });
  }
}
