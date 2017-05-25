import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

var lastMessageId = 0;

@Injectable()
export class RegistrationService {
  socket;
  commands;
  templateMessages;
  errorMessages;
  SOCKET_URL = `ws:${ location.origin.substring(location.protocol.length) }/socket`;

  constructor(private http: Http) { }

  init() {
    return this.http.get(`${ location.origin }/socket/session`).flatMap(res => {
      this.socket = Observable.webSocket(this.SOCKET_URL);
      this.commands = this.socket.filter(message => message.command && typeof message.command.type === 'string').pluck('command');
      this.errorMessages = this.socket.filter(message => message && message.error);
      this.templateMessages = this.commands.filter(({ type }) => type.startsWith('template'));

      // wait for 'template' response
      return this.templateMessages.filter(({type}) => type == 'template').take(1).map(({ data }) => data);
    });
  }

  send(message) {
    this.socket.next(JSON.stringify(message));
  }

  register(config) {
    let id = lastMessageId++
    this.send({ command: { type: 'template', data: config, id }});
    return this.templateMessages.filter(message => message.type === 'templateConfirm').take(1).flatMap(() => {
      return this.socket.filter(message => message.update).pluck('update');
    });
  }
}
