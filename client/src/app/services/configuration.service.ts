import { Injectable } from '@angular/core';
import { Headers, RequestOptions, Http } from '@angular/http';
import { Resolve } from '@angular/router';
import { BehaviorSubject, ReplaySubject, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from '../reducers';
import * as Models from '../models';
import { AuthorizationService } from '../services/authorization.service';
import * as Auth from '../actions/auth';

// configure data retrieval

@Injectable()
export class ConfigurationService implements Resolve<any> {
  public user$: Observable<Models.User>;

  public applications$: Observable<any>;

  constructor(private authorization: AuthorizationService, private store: Store<fromRoot.State>, private http: Http) {
    this.user$ = this.store.select(fromRoot.selectAuthUser);
    this.applications$ = this.store.select(fromRoot.selectAuthApplications);

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
