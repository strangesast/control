import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ConfigurationService } from './configuration.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private configuration: ConfigurationService, private router: Router) {}

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    let url = state.url;

    return this.checkUrl(url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(route, state);
  }

  checkUrl(url) {
    return this.configuration.isLoggedIn.take(1).flatMap(loggedIn => {
      if (loggedIn) return Observable.of(loggedIn);

      this.configuration.redirectUrl = url;

      this.router.navigate(['./login']);
      return Observable.of(false)
    });
  }
}
