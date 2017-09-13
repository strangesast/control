import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, RequestOptionsArgs, Headers } from '@angular/http';
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

  private requestOptions: Observable<RequestOptionsArgs>;
  redirectUrl: string;  // temporarily store where the user is headed

  urlPrefix: string = '/api';

  constructor(private store: Store<fromRoot.State>, private http: Http) {
    this.token$ = store.select(fromRoot.selectAuthToken).shareReplay(1);
    this.requestOptions = this.token$.map(mapTokenToOptions);
    this.user$ = store.select(fromRoot.selectAuthUser);
    this.applications$ = store.select(fromRoot.selectAuthApplications);
    this.userInitialized$ = store.select(fromRoot.selectUserInit);
    this.appsInitialized$ = store.select(fromRoot.selectAppsInit);
    this.appsLoadError$ = store.select(fromRoot.selectAppsErr);
    let params: URLSearchParams = new URLSearchParams();
    params.set('password', '1');
    this.users$ = this.get('/users', { search: params });


    // user / no user determined
    //this.ready$ = this.store.select(fromRoot.selectAuthReady);
    //this.applications$ = store.select(fromRoot.selectAuthApplications).skipUntil(this.ready$);
    this.loggedIn$ = this.userInitialized$.filter(r => r).flatMap(() => {
      return this.token$.map(t => !!t).distinctUntilChanged();
    });
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

  get(url: string, moreOptions: RequestOptionsArgs={}, prefix=true): Observable<any> {
    if (!url.startsWith('/')) throw new Error('invalid url');
    let path = (prefix ? this.urlPrefix : '') + url;
    return this.requestOptions.first().flatMap(options =>
      this.http.get(path, { ...options, ...moreOptions }).map(mapToJson));
  }

  post(url: string, body: any, moreOptions: RequestOptionsArgs={}, prefix=true): Observable<any> {
    if (!url.startsWith('/')) throw new Error('invalid url');
    let path = (prefix ? this.urlPrefix : '') + url;
    return this.requestOptions.first().flatMap(options =>
      this.http.post(path, JSON.stringify(body), { ...options, ...moreOptions }).map(mapToJson));
  }

  put(url: string, body: any, moreOptions: RequestOptionsArgs={}, prefix=true): Observable<any> {
    if (!url.startsWith('/')) throw new Error('invalid url');
    let path = (prefix ? this.urlPrefix : '') + url;
    return this.requestOptions.first().flatMap(options =>
      this.http.put(path, JSON.stringify(body), { ...options, ...moreOptions }).map(mapToJson));
  }

  delete(url: string, moreOptions: RequestOptionsArgs={}, prefix=true) {
    if (!url.startsWith('/')) throw new Error('invalid url');
    let path = (prefix ? this.urlPrefix : '') + url;
    return this.requestOptions.first().flatMap(options =>
      this.http.delete(path, {  ...options, ...moreOptions }).map(mapToJson));
  }
}

function mapTokenToOptions(token: string): RequestOptionsArgs {
  let headers: any = { 'Content-Type': 'application/json' };
  if (token) {
    headers = { ...headers, 'Authorization': 'JWT ' + token };
  }
  return { headers: new Headers(headers) };
}

function mapToJson(res: Response): any {
  return res.json();
}
