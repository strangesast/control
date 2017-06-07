import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ConfigurationService implements Resolve<any> {
  public isLoggedIn = new BehaviorSubject(false);
  public redirectUrl: string;

  constructor() { }

  resolve() {
    return Promise.resolve();
  }

}
