import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthorizationService } from '../services/authorization.service';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private authorization: AuthorizationService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
      //let defaultApp$ = this.authorization.applications$.skipWhile(apps => !apps || !apps.length).map(apps => apps[0]);
      let url = state.url;
      return this.authorization.loggedIn$.first().flatMap(loggedIn => {
        if (loggedIn) {
          return this.authorization.applications$.find(apps => apps && apps.length > 0).map(apps => {
            this.router.navigateByUrl(apps[0].path);
            return false;
          });
        } else {
          return Observable.of(true);
        }
      });
  }
}
