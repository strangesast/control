import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers, Response } from '@angular/http';
import { Action, INIT } from '@ngrx/store';
import { Effect, Actions, toPayload } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { App as AppActions } from '../actions';
import { Application, User, UserLoad } from '../models';
import { AppState, selectAuthToken } from '../reducers';

@Injectable()
export class AppEffects {
  options$: Observable<Partial<RequestOptions>>;

  constructor(
    private http: Http,
    private actions$: Actions,
    store: Store<AppState>
  ) {
    this.options$ = store.select(selectAuthToken).map(getOptions);;
  }

  @Effect() init$ = this.actions$
    .ofType(AppActions.Init.typeString)
    .flatMap(() => getStorage())
    .map(({ user, token }) =>
      new AppActions.UserLoadSuccess({ user, token }));

  @Effect() updateUser$ = this.actions$
    .ofType(AppActions.Login.typeString)
    .map(toPayload)
    .flatMap(payload => {
      let { user, token } = payload;
      return updateStorage({ user, token }).mapTo(payload);
    })
    //.delay(1000)
    .map(({ user, token, applications }) =>
      new AppActions.UserLoadSuccess({ user, token, applications })
    );

  // user changed/initialized action
  @Effect() requestLoadApplications = this.actions$
    .ofType(AppActions.UserLoadSuccess.typeString)
    .map(toPayload)
    .filter(({ token, applications }) => token && !(applications && applications.length))
    .map(() => new AppActions.LoadApplications());

  @Effect() loadApplications$ = this.actions$
    .ofType(AppActions.LoadApplications.typeString)
    .switchMap(() => this.options$.first().flatMap(options =>
      this.http.get(`/api/user/applications`, options).map(res => {
          let applications = res.json();
          return applications;
        })
      )
    )
    //.delay(1000)
    .map(applications => new AppActions.LoadApplicationsSuccess(applications))
    .catch(err => {
      if (err instanceof Response) {
        return Observable.of(new AppActions.LoadApplicationsFailure({ code: err.status, message: err.statusText }));
      } else {
        throw new Error('can\'t handle that error');
      }

    })
    //.catch(err => Observable.of(new AppActions.LoadApplicationsFailure(err)));


  @Effect() register$ = this.actions$
    .ofType(AppActions.RegisterRequest.typeString)
    .map(toPayload)
    .switchMap(payload =>
      this.options$.first().flatMap(options =>
        this.http.post('/api/register', JSON.stringify(payload), options).map(res => {
          let { user, token, applications } = res.json();
          return new AppActions.Register({ user, token, applications });
        })
      )
    )
    //.catch((res) => Observable.of(new AppActions.RegisterFailure(res.json())))

  // combine successful registrations and login requests
  @Effect() login$ = Observable.merge(
      this.actions$
        .ofType(AppActions.LoginRequest.typeString)
        .map(toPayload)
        .switchMap(payload =>
          this.options$.first().flatMap(options =>
            this.http.post('/api/login', JSON.stringify(payload), options).map(res => {
              let { user, token, applications } = res.json();
              return { user, token, applications };
            })
          )
        )
      ,
      this.actions$
        .ofType(AppActions.Register.typeString)
        .map(toPayload)
    )
    .map(({ user, token, applications }) =>
      new AppActions.Login({ user, token, applications })
    )
    //.catch((res) => {
    //  let error = { message: null, code: 500 };
    //  try {
    //    error.message = res.json();
    //  } catch (e) {
    //    error = res.statusText;
    //  }
    //  error.code = res.status;

    //  return Observable.of(new AppActions.LoginFailure([ error ]));
    //})

  @Effect() logout$ = this.actions$
    .ofType(AppActions.LogoutRequest.typeString)
    .switchMap(() => clearStorage().map(() => new AppActions.Logout()));

}

function getOptions (token?: string): Partial<RequestOptions> {
  return { headers: new Headers({
    'Content-Type': 'application/json',
    'Authorization': token ? 'JWT ' + token : undefined
  }) };
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
