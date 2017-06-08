import { Injectable } from '@angular/core';
import { Headers, RequestOptions, Http } from '@angular/http';
import { Resolve } from '@angular/router';
import { BehaviorSubject, ReplaySubject, Observable } from 'rxjs';

@Injectable()
export class ConfigurationService implements Resolve<any> {
  public isLoggedIn = new ReplaySubject(1);
  public user = new ReplaySubject();
  public redirectUrl: string;

  constructor(private http: Http) { }

  resolve() {
    try {
      let json = localStorage.getItem('currentUser')
      this.user.next(JSON.parse(json));
    } catch (e) {}
  }

  login(username: string, password: string) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers });
    return this.handleResponse(this.http.post('/api/login', { username, password }, options));
  }

  register(user) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers });
    return this.handleResponse(this.http.post('/api/register', user, options));
  }

  logout() {
    localStorage.removeItem('currentUser');
  }

  handleResponse(stream) {
    return stream.map(res => {
      let body = res.json()
      if (body) {
        let { token, user } = body;
        if (user && token) {
          user.token = token;
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }
      return;

    }).catch(res => {
      let body;
      try {
        body = res.json();
      } catch (e) {}
      return Observable.throw(body || res);
    });
  }
}

