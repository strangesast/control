import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Headers, RequestOptions, Http } from '@angular/http';
import { Resolve } from '@angular/router';
import { BehaviorSubject, ReplaySubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import * as fromRoot from '../reducers';
import * as Models from '../models';
import * as Auth from '../actions/auth';

import { AuthorizationService } from '../services/authorization.service';

// configure data retrieval

@Injectable()
export class ConfigurationService implements Resolve<any> {
  public user$: Observable<Models.User>;

  public applications$: Observable<any>;

  constructor(private authorization: AuthorizationService, private store: Store<fromRoot.State>, private http: Http, private router: Router) {
    this.user$ = this.store.select(fromRoot.selectAuthUser);
    this.applications$ = this.store.select(fromRoot.selectAuthApplications);

    this.applications$.subscribe(apps => {
      let app = apps[0];

      // remove the old default redirect (if exists)
      let config = this.router.config;
      let children = this.router.config.find(route => route.path === '').children;
      console.log('router', this.router);
      let i = children.findIndex(route => route.path == '');
      if (i > -1) {
        children.splice(i, 1);
      }

      if (app) {
        children.push({ path: '', redirectTo: app.path, pathMatch: 'full' }); 
      }

      this.router.resetConfig(config);
    })

    // applications granted to user
    // [
    //   {
    //     name, path
    //   }
    //   ...
    // ]
  
  }

  resolve() {
    let userString = localStorage.getItem('currentUser');
    let user: Models.User;
    let token = localStorage.getItem('token');
    try {
      user = JSON.parse(userString);
    } finally {
      user = user || null;
      token = token || null;
    }
    if (user && token) {

      let options: Partial<RequestOptions> = {
        headers: new Headers({
          'Content-Type': 'application/json',
          'Authorization': 'JWT ' + token
        })
      };
      return this.http.get(`/api/user/applications`, options).map(res => {
        let applications = res.json();

        this.store.dispatch(new Auth.Login({ user, token, applications }));
      });
    }
    return Observable.of(null);
  }

  getApplications() {
    return this.applications$;
  }
}
