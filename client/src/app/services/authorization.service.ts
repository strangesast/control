import { Injectable } from '@angular/core';
import { RequestOptions, Headers } from '@angular/http';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { User } from '../models';
import * as Actions from '../actions';
import * as fromRoot from '../reducers';

// control login / logout / authorization header (jwt)

@Injectable()
export class AuthorizationService {
  token$: Observable<string>;
  user$: Observable<User>;
  loggedIn$: Observable<boolean>;

  requestOptions: Observable<Partial<RequestOptions>>;
  redirectUrl: string;  // temporarily store where the user is headed

  constructor(private store: Store<fromRoot.State>) {
    this.token$ = store.select(fromRoot.selectAuthToken);
    this.user$ = store.select(fromRoot.selectAuthUser);
    this.loggedIn$ = this.token$.map(token => !!token);

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
    this.store.dispatch(new Actions.Auth.RegisterRequest(user));
  }

  login(username, password) {
    this.store.dispatch(new Actions.Auth.LoginRequest({ username, password }));
  }

  logout() {
    this.store.dispatch(new Actions.Auth.LogoutRequest());
    return Observable.of(null);
  }
}
