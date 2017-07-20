import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { User, Application } from '../models';
import { App as AppActions } from '../actions';
import * as fromRoot from '../reducers';

// control login / logout / authorization header (jwt)

@Injectable()
export class AuthorizationService {
  token$: Observable<string>;
  user$: Observable<User>;
  users$: Observable<User[]>;
  applications$: Observable<Application[]>;

  loggedIn$: Observable<boolean>;

  public userInitialized$: Observable<boolean>;
  public appsInitialized$: Observable<boolean>;
  public appsLoadError$: Observable<any>;

  requestOptions: Observable<Partial<RequestOptions>>;
  redirectUrl: string;  // temporarily store where the user is headed

  constructor(private store: Store<fromRoot.State>, http: Http) {
    this.token$ =        store.select(fromRoot.selectAuthToken);
    this.user$ =         store.select(fromRoot.selectAuthUser);
    this.applications$ =         store.select(fromRoot.selectAuthApplications);
    this.userInitialized$ = this.store.select(fromRoot.selectUserInit);
    this.appsInitialized$ = this.store.select(fromRoot.selectAppsInit);
    this.appsLoadError$ = this.store.select(fromRoot.selectAppsErr);
    this.users$ = http.get('/api/users').map(res => res.json());

    // user / no user determined
    //this.ready$ = this.store.select(fromRoot.selectAuthReady);
    //this.applications$ = store.select(fromRoot.selectAuthApplications).skipUntil(this.ready$);
    this.loggedIn$ = this.userInitialized$.filter(r => r).flatMap(() => {
      return this.token$.map(token => Boolean(token)).distinctUntilChanged();
    });
    this.requestOptions = this.token$.map(token => ({
      headers : new Headers({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + token
      })
    }));
  }

  register(user) {
    this.store.dispatch(new AppActions.RegisterRequest(user));
  }

  login(username, password) {
    let action = new AppActions.LoginRequest({ username, password });
    this.store.dispatch(action);
  }

  logout() {
    this.store.dispatch(new AppActions.LogoutRequest());
  }
}
