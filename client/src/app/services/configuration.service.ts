import { Injectable } from '@angular/core';
import { Headers, RequestOptions, Http } from '@angular/http';
import { Resolve } from '@angular/router';
import { BehaviorSubject, ReplaySubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import * as Models from '../models';
import { LoginRequest, LogoutRequest, RegisterRequest } from '../actions';

@Injectable()
export class ConfigurationService implements Resolve<any> {
  public isLoggedIn = new ReplaySubject(1);
  public user: Observable<Models.User>;

  public redirectUrl: string;

  applications = [
    {
      name: 'Dashboard',
      path: 'dashboard'
    },
    {
      name: 'Quick View',
      path: 'topview'
    },
    {
      name: 'Thermostat',
      path: 'thermostat'
    },
    {
      name: 'Energy Profile',
      path: 'energy'
    }
  ];

  constructor(private store: Store<fromRoot.State>, private http: Http) {
    this.user = this.store.select(fromRoot.selectAuthUser);
  }

  resolve() {
    return this.user.take(1);
  }

  login(username: string, password: string) {
    //let headers = new Headers({ 'Content-Type': 'application/json' });
    //let options = new RequestOptions({ headers });
    //return this.handleResponse(this.http.post('/api/login', { username, password }, options));
    this.store.dispatch(new LoginRequest({ username, password }));
  }

  register(user) {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers });
    this.store.dispatch(new RegisterRequest(user));
  }

  logout() {
    this.store.dispatch(new LogoutRequest());
    localStorage.removeItem('currentUser');
  }

  //handleResponse(stream) {
  //  return stream.map(res => {
  //    let body = res.json()
  //    if (body) {
  //      let { token, user } = body;
  //      if (user && token) {
  //        user.token = token;
  //        localStorage.setItem('currentUser', JSON.stringify(user));
  //        this.user.next(user);
  //      }
  //    }
  //    return;

  //  }).catch(res => {
  //    let body;
  //    try {
  //      body = res.json();
  //    } catch (e) {}
  //    return Observable.throw(body || res);
  //  });
  //}
}
