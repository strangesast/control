import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Resolve } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class ConfigurationService implements Resolve<any> {
  public isLoggedIn = new BehaviorSubject(false);
  public redirectUrl: string;

  constructor(private http: Http) { }

  resolve() {
    return Promise.resolve();
  }

  login(username: string, password: string) {
    return this.http.post('/login', JSON.stringify({ username, password })).flatMap(res => {
      console.log(res);
      return Observable.of(null);
    });
  }

  register(username: string, password: string) {
  }

  logout() {
  }
}
