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
      let defaultApp$ = this.authorization.applications$.map(apps => apps[0]);
      return this.authorization.loggedIn$.first().withLatestFrom(defaultApp$).map(([ loggedIn, app ]) => {
        if (loggedIn) {
          this.router.navigate([ app.path ]);
          return false;
        }
        return true;
      });
  }
}
