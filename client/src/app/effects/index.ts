import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Effect, Actions } from '@ngrx/effects';
import * as AppActions from '../actions';

import { Observable } from 'rxjs';

@Injectable()
export class AuthEffects {
  constructor(private actions$: Actions, private http: Http) {}

  readonly defaultOptions: Partial<RequestOptions> = { headers: new Headers({ 'Content-Type': 'application/json' }) };

  @Effect() register$ = this.actions$
    .ofType(AppActions.Auth.REGISTER)
    .map((action: AppActions.Auth.RegisterRequest) => JSON.stringify(action.payload))
    .switchMap(payload => this.http.post('/api/register', payload, this.defaultOptions)
      .map(res => {
        let { user, token, applications } = res.json();
        return new AppActions.Auth.Register({ user, token, applications });
      })
      .catch((res) => Observable.of(new AppActions.Auth.RegisterFailure(res.json())))
    );

  // combine successful registrations and login requests
  @Effect() login$ = Observable.merge(
      this.actions$
        .ofType(AppActions.Auth.LOGIN_REQUEST)
        .map((action: AppActions.Auth.LoginRequest) => JSON.stringify(action.payload))
        .switchMap(payload => this.http.post('/api/login', payload, this.defaultOptions)
          .map(res => {
            let { user, token, applications } = res.json();
            return { user, token, applications };
          })
          .catch((res) => {
            let error = { message: null, code: 500 };
            try {
              error.message = res.json();
            } catch (e) {
              error = res.statusText;
            }
            error.code = res.status;

            return Observable.of(new AppActions.Auth.LoginFailure([ error ]));
          })
        )
      ,
      this.actions$.ofType(AppActions.Auth.REGISTER)
        .map((action: AppActions.Auth.Register) => action.payload)
    ).map(({ user, token, applications }) => {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', token);

      return new AppActions.Auth.Login({ user, token, applications });
    });

  @Effect() logout$ = this.actions$
    .ofType(AppActions.Auth.LOGOUT_REQUEST)
    // could be async
    .switchMap(() => Observable.of(null)
      .map(res => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      return { type: AppActions.Auth.LOGOUT };
      })
    );
}
