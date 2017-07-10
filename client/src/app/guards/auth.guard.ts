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
import { ConfigurationService } from '../services/configuration.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
  constructor(private configuration: ConfigurationService, private router: Router) {}

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
    return this.configuration.user.first().map((user) => {
      if (user) {
        return true;
      } else {
        this.router.navigate(['./login'], { queryParams: { 'redirectUrl': url }});
        return false;
      }
    })
  }
}
