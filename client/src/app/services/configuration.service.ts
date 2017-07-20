import { Injectable } from '@angular/core';
import { Router, Route, Routes } from '@angular/router';
import { Headers, RequestOptions, Http } from '@angular/http';
import { Resolve } from '@angular/router';
import { BehaviorSubject, ReplaySubject, Observable } from 'rxjs';
import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject';
import { Store, createSelector } from '@ngrx/store';

import * as fromRoot from '../reducers';
import * as Models from '../models';
import * as AppActions from '../actions/app';

import { AuthorizationService } from '../services/authorization.service';

import { AuthGuard } from '../guards';
import { DummyComponent } from '../components/dummy/dummy.component';
import { LoginComponent } from '../components/login/login.component';
import { RegisterComponent } from '../components/register/register.component';

// configure data retrieval

@Injectable()
export class ConfigurationService implements Resolve<any> {
  public user$: Observable<Models.User>;
  public applications$: Observable<any>;
  public socket: WebSocketSubject<any>;

  constructor(private authorization: AuthorizationService, private store: Store<fromRoot.State>, private http: Http, private router: Router) {
    this.user$ = this.store.select(fromRoot.selectAuthUser);
    this.applications$ = this.store.select(fromRoot.selectAuthApplications);

    let socketUrl = `ws://${ location.host }/socket`;
    this.socket = Observable.webSocket(socketUrl);

    this.store.dispatch(new AppActions.Init());

    // applications granted to user
    // [
    //   {
    //     name, path
    //   }
    //   ...
    // ]
  
  }

  resolve() {
    return this.authorization.userInitialized$.find(i => i);
  }
}
