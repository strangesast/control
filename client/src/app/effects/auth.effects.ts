import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Action, INIT } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Auth as AuthActions } from '../actions';
import { Application, User, UserLoad } from '../models';

import { Observable } from 'rxjs';

@Injectable()
export class AuthEffects {
  constructor(
    private http: Http,
    private actions$: Actions
  ) {}

  readonly defaultOptions: Partial<RequestOptions> = {
    headers: new Headers({ 'Content-Type': 'application/json' })
  };

  @Effect() init$ = this.actions$
    .ofType(AuthActions.Init.typeString)
    .flatMap(() => getStorage())
    .map(({ user, token }) =>
      new AuthActions.UserLoadSuccess({ user, token }));

  // user changed/initialized action
  @Effect() userLoad$ = Observable.merge(
    // from init (localStorage)
    this.actions$
      .ofType(AuthActions.UserLoadSuccess.typeString)
      .map(toPayload)
      .filter(({ token }) => token)
      .switchMap(({ user, token, applications }: UserLoad) => {
        if (applications && applications.length) {
          return Observable.never();
        }

        return this.getApplications(token).map(applications => {
          if (applications.length == 0)
             // dont trigger the same event (endless loop)
             throw new Error('user has no applications');
          return { user, token, applications };
        });
      })
    ,
    // from http request
    this.actions$.ofType(AuthActions.Login.typeString)
      .map(toPayload)
      .switchMap(({ user, token, applications }) => {
        // login request returned user's applications
        let hasApps = applications && applications.length > 0;
        let apps = hasApps ? Observable.of(applications) : this.getApplications(token);
        // use or get applications
        return apps.flatMap(applications =>
          // update record of current user (perhaps asynchronously)
          updateStorage({ user, token }).map(() =>
            // return UserLoad
            ({ user, token, applications })
          )
        );
      })
    )
    // save user / token
    .map((payload: any) => new AuthActions.UserLoadSuccess(payload))
    .catch(err => Observable.of(new AuthActions.UserLoadFailure(err)));


  @Effect() register$ = this.actions$
    .ofType(AuthActions.RegisterRequest.typeString)
    .map(toPayload)
    .switchMap(payload => this.http.post('/api/register', JSON.stringify(payload), this.defaultOptions)
      .map(res => {
        let { user, token, applications } = res.json();
        return new AuthActions.Register({ user, token, applications });
      })
      .catch((res) => Observable.of(new AuthActions.RegisterFailure(res.json())))
    );

  // combine successful registrations and login requests
  @Effect() login$ = Observable.merge(
      this.actions$
        .ofType(AuthActions.LoginRequest.typeString)
        .map(toPayload)
        .switchMap(payload => this.http.post('/api/login', JSON.stringify(payload), this.defaultOptions)
          .map(res => {
            let { user, token, applications } = res.json();
            return { user, token, applications };
          })
        )
      ,
      this.actions$
        .ofType(AuthActions.Register.typeString)
        .map(toPayload)
    )
    .map(({ user, token, applications }) =>
      new AuthActions.Login({ user, token, applications })
    )
    .catch((res) => {
      let error = { message: null, code: 500 };
      try {
        error.message = res.json();
      } catch (e) {
        error = res.statusText;
      }
      error.code = res.status;

      return Observable.of(new AuthActions.LoginFailure([ error ]));
    })

  @Effect() logout$ = this.actions$
    .ofType(AuthActions.LogoutRequest.typeString)
    .switchMap(() => clearStorage().map(() => new AuthActions.Logout()));


  getApplications(token): Observable<Application[]> {
    let options: Partial<RequestOptions> = {
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + token
      })
    }
  
    return this.http.get(`/api/user/applications`, options).map(res => {
      let applications = res.json();
      return applications;
    });
  }
}

function getStorage(): Observable<UserLoad> {
  let userString = localStorage.getItem('currentUser');
  let user: User;
  let token = localStorage.getItem('token');

  try {
    user = JSON.parse(userString);
  } finally {
    user = user || null;
    token = token || null;
  }
  return Observable.of({ user, token });
}

function updateStorage({ user, token }: UserLoad): Observable<void> {
  localStorage.setItem('currentUser', JSON.stringify(user));
  localStorage.setItem('token', token);
  return Observable.of(undefined);
}

function clearStorage(): Observable<void> {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('token');
  return Observable.of(undefined);
}
