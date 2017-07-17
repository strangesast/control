import { Injectable } from '@angular/core';
import { RequestOptions, Headers } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { User, Application } from '../models';
import { Auth as AuthActions } from '../actions';
import * as fromRoot from '../reducers';

// control login / logout / authorization header (jwt)

@Injectable()
export class AuthorizationService {
  token$: Observable<string>;
  user$: Observable<User>;
  applications$: Observable<Application[]>;
  loggedIn$: Observable<boolean>;
  ready$: Observable<boolean>;

  requestOptions: Observable<Partial<RequestOptions>>;
  redirectUrl: string;  // temporarily store where the user is headed

  constructor(private store: Store<fromRoot.State>) {
    this.token$ =        store.select(fromRoot.selectAuthToken);
    this.user$ =         store.select(fromRoot.selectAuthUser);

    // user / no user determined
    this.ready$ = this.store.select(fromRoot.selectAuthReady);
    this.applications$ = store.select(fromRoot.selectAuthApplications).skipUntil(this.ready$);
    this.loggedIn$ = this.ready$.filter(r => r).flatMap(() => {
      return this.token$.map(token => Boolean(token)).distinctUntilChanged();
    });
    this.requestOptions = this.token$.map(token => {
      let headers = new Headers({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + token
      });
      let options: Partial<RequestOptions> = { headers };
      return options;
    });
  }

  register(user) {
    this.store.dispatch(new AuthActions.RegisterRequest(user));
  }

  login(username, password) {
    let action = new AuthActions.LoginRequest({ username, password });
    this.store.dispatch(action);
  }

  logout() {
    this.store.dispatch(new AuthActions.LogoutRequest());
  }
}
