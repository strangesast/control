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

    //  for (let i=0; i<routes.length; i++) {
    //    let route = routes[i];
    //    if (route.path == '') {
    //      let children = apps.map (app => {
    //        let { _id, path, modulePath, name } = app;
    //        return {
    //          path,
    //          loadChildren: modulePath,
    //          //canLoad: [ AuthGuard ]
    //        };
    //      }).concat({
    //        path: '',
    //        redirectTo: apps[0].path,
    //        pathMatch: 'full'
    //      });
    //      routes[i] = { ...route, children };
    //    }
    //  }
    //  console.log('routes', routes);
    //  return routes;
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

    return this.authorization.ready$.skipWhile(ready => !ready).first().withLatestFrom(this.applications$).flatMap(([ready, apps]) =>  {
      return Observable.of(apps);
    });
  }
}
