import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AuthorizationService } from '../services/authorization.service';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private auth: AuthorizationService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
      //let defaultApp$ = this.authorization.applications$.skipWhile(apps => !apps || !apps.length).map(apps => apps[0]);
      let url = state.url;
      return this.auth.loggedIn$.first().flatMap(loggedIn => {
        if (loggedIn) {
          let success$ = this.auth.applications$.find(apps => apps && apps.length > 0).map(apps => {
            this.router.navigateByUrl(apps[0].path);
            return false;
          });
          let failure$ = this.auth.appsLoadError$.map(error => true);
          return Observable.merge(success$, failure$).take(1);
        } else {
          return Observable.of(true);
        }
      });
  }
}
