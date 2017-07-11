import { Injectable } from '@angular/core';
import { Route } from '@angular/router';
import {
  Router,
  CanLoad,
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthorizationService } from '../services/authorization.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private authorization: AuthorizationService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let url = state.url;
    return this.checkUrl(url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(route, state);
  }

  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    return Observable.of(true);
  }

  checkUrl(url) {
    // should also check if application is granted to user

    return this.authorization.loggedIn$.first().map((loggedIn) => {
      if (loggedIn) {
        return true;
      }
      this.router.navigate(['./login'], { queryParams: { 'redirectUrl': url }});
      return false;
    })
  }
}
