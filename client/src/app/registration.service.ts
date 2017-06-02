import { Input, Output, EventEmitter, Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Http } from '@angular/http';
import { Observer, Subject, Observable, BehaviorSubject, ReplaySubject } from 'rxjs';

var lastMessageId = 0;

@Injectable()
export class RegistrationService implements Resolve<any> {
  socket;
  SOCKET_URL = `ws:${ location.origin.substring(location.protocol.length) }/socket`;
  registeredTemplate: ReplaySubject<any>;
  updates: ReplaySubject<any>;

  get template() {
    return this.registeredTemplate.take(1)
  }
  set template(template) {
    this.registeredTemplate.next(template);
  }

  constructor(private http: Http) { }

  resolve() {
    return this.init();
  }

  init() {
    return Promise.resolve();
    /*
    return this.http.get(`${ location.origin }/socket/session`).flatMap(res => {
      if (res.status === 200) {
        return createSocketSubject(this.SOCKET_URL).map(socket => {
          this.socket = socket;

          socket.filter(message => message.error).subscribe(console.error.bind(console));
          
          // should check locally too
          socket.next({ command: { type: 'currentTemplate' }});

          let validCommands = socket.filter(message => message.command && message.command.type);
          
          let templateStream = validCommands.pluck('command')
            .filter(({ type }) => type == 'template')
            .pluck('data')
            .publishReplay(1)
            .refCount()
          
          let sink = new Subject();
          sink.debounceTime(1000).subscribe(template => {
            console.log('setting template');
            socket.next({ command: { type: 'template', data: template }});
          });
          
          this.registeredTemplate = Subject.create(sink, templateStream)
          
          this.updates = socket.filter(message => message.update).pluck('update', 'values').publishReplay(1).refCount();

          return Observable.of(null);
        });
      }
      return Observable.of(null);
    });
    */
  }


  // attribute
  // {
  //   read: <boolean>
  //     probably always true
  //   write: <boolean>
  //     attach listener to "(name)Change" event
  //   type: <string, number, ...>
  // }

  register(attributes) {
    let ids = Object.keys(attributes).map(name => attributes[name].id);

    let objects = this.updates.map(arr => arr.filter(({ name }) => ids.indexOf(name) > -1).reduce((acc, { name, value, by }) => Object.assign(acc, { [name]: { value, by } }), {}));

    let stream = objects.take(1).flatMap(_objects => objects.pairwise().map(diff).startWith(_objects).filter(obj => Object.keys(obj).length > 0));

    this.updates.map(obj => {
      let copy = {};
      for (let name in attributes) {
        let { id } = attributes[name];
        copy[id] = obj[id]
      }
    });

    return communicate(Subject.create(this.updates, stream), this.socket)
  }
}

function diff([a, b]) {
  let keys = Object.keys(a).concat(Object.keys(b)).filter((el, i, arr) => arr.indexOf(el) == i);
  let changes = {};
  for (let key of keys) {
    let av = a[key], bv = b[key];
    // if not the same
    if (!(av && bv && av.value == bv.value && av.id == bv.id)) {
      changes[key] = b[key] || { value: undefined }; // not ideal
    }
  }
  return changes;
}

// id generator, 9 digits
function id() {
  return ('0'.repeat(9) + Math.floor(Math.random()*1e9)).slice(-9);
}

function communicate (outputStream, socketSubject) {
  let pending = new BehaviorSubject({});
  // { [key]: { id, stale: [], current } }

  let inputStream = new ReplaySubject<{ name, value }>(1);

  let pendingUpdates = Observable.merge(
    outputStream.withLatestFrom(pending),
    pending.withLatestFrom(outputStream).map(([_pending, val]) => [val, _pending])
  ).map(mergeAppIntermediate).map(obj => {
    let copy = {};
    for (let key in obj) {
      copy[key] = obj[key].value;
    }
    return copy;
  });

  inputStream.withLatestFrom(pending).map(([{ name, value }, _pending]) => {
    _pending[name] = _pending[name] || { stale: [], id: null }
    _pending[name].current = value;
    _pending[name].changing = true;
    return _pending;
  }).subscribe(pending);

  let bufferOn = inputStream.debounceTime(500);
  let updateRequests = inputStream.window(bufferOn).flatMap(stream => stream.reduce((a, { name, value }) => Object.assign(a, {[name]: value}), <any>{}));
  
  let updateStream = updateRequests.map(changed => {
    return { by: id(), values: Object.keys(changed).map(name => ({ name, value: changed[name] })) };
  }).share();
  
  updateStream.withLatestFrom(pending).map(([{ by, values }, _pending]) => {
    for (let { name, value } of values) {
      _pending[name] = _pending[name] || { id: null, stale: [] };
      if (_pending[name].id !== null) _pending[name].stale.push(_pending[name].id);
      _pending[name].id = by;
      _pending[name].changing = false;
    }
    return _pending;
  }).subscribe(pending);
  
  updateStream.subscribe(update => {
    console.log('sending update', update);
    socketSubject.next({ update })
  });

  let interAppUpdates = socketSubject.filter(message => message.update && message.update.values).pluck('update', 'values').withLatestFrom(pending).map(([ values, _pending ]) => {
    if (!Array.isArray(values)) throw new Error(`invalid update message.  provided "${ typeof values }" instead of "array"`);
    let updates = {};
    let i;
    for (let { by, name, value } of values) {
      if (_pending[name]) {
        if (_pending[name].id == by) {
          _pending[name].id = null;
          updates[name] = value;
          continue;

        } else if ((i = _pending[name].stale.indexOf(by)) > -1) {
          _pending[name].stale.splice(i, 1);
          continue;
        }
      }
      updates[name] = value;
    }
    return { pending: _pending, updates };
  }).share();

  //let interAppUpdates = socketSubject.filter(message => message.update && message.update.values).pluck('update', 'values').flatMap(values => Observable.from(values)).withLatestFrom(pending).share();
  //let needUpdate = interAppUpdates.filter(({ name, by }, _pending) => (_pending[name] && _pending[name].id == by) || _pending[name] == undefined);

  //needUpdate.map

  //interAppUpdates.filter(({ name }, _pending) => _pending[name]).flatMap(({ name, by }, _pending) => {
  //  let i = _pending.stale.indexOf(by);
  //  if (_pending[name].id == by) {
  //    _pending[name].id = null;
  //    return Observable.of(_pending);
  //  }
  //  if (i > -1) {
  //    _pending[name].stale.splice(i, 1);
  //    return Observable.of(_pending);
  //  }
  //  return Observable.empty();
  //}).subscribe(pending);

  interAppUpdates.pluck('pending').subscribe(pending);
  interAppUpdates.pluck('updates').filter(obj => Object.keys(obj).length).withLatestFrom(outputStream).map(([a, b]) => Object.assign(b, a)).subscribe(outputStream);

  return Subject.create(inputStream, pendingUpdates);

}

function mergeAppIntermediate([value, intermediate]) {
  let merged = {};
  // waiting for a response or changing?
  for (let key of Object.keys(intermediate)) {
    let { id, changing, current } = intermediate[key];
    if (id || changing) {
      merged[key] = current;
    }
  }
  // by default use app value
  for (let key of Object.keys(value)) {
    if (merged[key] == undefined) {
      merged[key] = value[key]
    }
  }
  return merged;
}

function createSocketSubject (address) {
  let socket = new WebSocket(address);
  return Observable.fromEvent(socket, 'open').take(1).map(() => {
    let observer = {
      next: (message) => socket.send(JSON.stringify(message)),
      error: console.error.bind(console),
      complete: () => console.log('socket closed')
    };

    let observable = Observable.fromEvent(socket, 'message').flatMap((evt:any) => {
      try {
        return Observable.of(JSON.parse(evt.data));
      } catch (e) {
        return Observable.empty();
      }
    })

    return Subject.create(observer, observable);
  });
}

