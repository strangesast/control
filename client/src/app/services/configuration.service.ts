import { Injectable } from '@angular/core';
import { Router, Route, Routes } from '@angular/router';
import { Headers, RequestOptions, Http } from '@angular/http';
import { Resolve } from '@angular/router';
import { BehaviorSubject, ReplaySubject, Observable } from 'rxjs';
import { Store, createSelector } from '@ngrx/store';

import * as fromRoot from '../reducers';
import * as Models from '../models';
import * as AuthActions from '../actions/auth';

import { AuthorizationService } from '../services/authorization.service';

import { AuthGuard } from '../guards';
import { DummyComponent } from '../components/dummy/dummy.component';
import { LogInComponent } from '../components/log-in/log-in.component';
import { RegisterComponent } from '../components/register/register.component';

// configure data retrieval

@Injectable()
export class ConfigurationService implements Resolve<any> {
  readonly defaultRoutes = [
    { path: 'login',    component: LogInComponent,    canActivate: [ AuthGuard ] },
    { path: 'register', component: RegisterComponent, canActivate: [ AuthGuard ] },
    {
      path: '',
      resolve: { configuration: ConfigurationService },
      canActivate: [ AuthGuard ],
      canActivateChild: [ AuthGuard ],
      children: [
        { path: '**', component: DummyComponent }
      ]
    }
  ];

  public routerConfig$: Observable<Routes>;
  public user$: Observable<Models.User>;

  public applications$: Observable<any>;

  constructor(private authorization: AuthorizationService, private store: Store<fromRoot.State>, private http: Http, private router: Router) {
    this.user$ = this.store.select(fromRoot.selectAuthUser);
    this.applications$ = this.store.select(fromRoot.selectAuthApplications);

    //this.routerConfig$ = this.applications$.map(apps => {
    //  let routes: Routes = [ ...this.defaultRoutes ];

    //  if (apps.length) {
    //    let route = { ...routes.find(route => route.path === '') };
    //    route.children = apps.map (app => {
    //      let { _id, path, modulePath, name } = app;
    //      return { path, loadChildren: modulePath, canLoad: [ AuthGuard ] };
    //    });
    //  }

    //  return routes;
    //});

    //this.applications$.subscribe(apps => {
    //  let app = apps[0];

    //  // remove the old default redirect (if exists)
    //  let config = this.router.config;
    //  let children = this.router.config.find(route => route.path === '').children;
    //  let i = children.findIndex(route => route.path == '');
    //  if (i > -1) {
    //    children.splice(i, 1);
    //  }

    //  if (app) {
    //    children.push({ path: '', redirectTo: app.path, pathMatch: 'full' }); 
    //  }

    //  this.router.resetConfig(config);
    //});

    this.store.dispatch(new AuthActions.Init());

    // applications granted to user
    // [
    //   {
    //     name, path
    //   }
    //   ...
    // ]
  
  }

  resolve() {
    // subscribe router.config to routerConfig
    //this.routerConfig$.subscribe(config => this.router.resetConfig(config));

    return this.authorization.ready$.skipWhile(ready => !ready).first().withLatestFrom(this.applications$).flatMap(([ready, apps]) =>  {
      return Observable.of(apps);
    });
  }
}
