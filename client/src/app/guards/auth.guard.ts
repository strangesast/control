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

    let loggedIn$ = this.authorization.loggedIn$.first();

    return loggedIn$.withLatestFrom(this.authorization.applications$).map(([loggedIn, apps]) => {
      let loginUrl = url.startsWith('/login') || url.startsWith('/register');
      if (!loggedIn && loginUrl) {
        return true;

      } else if (!loggedIn && !loginUrl) {
        this.router.navigate(['/login']);
        return false;

      } else if (loginUrl || url == '/') {
        console.log('apps', apps);
        this.router.navigate([apps[0].path]);
        return false;

      } else {
        return true;
      }
    });
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(route, state);
  }

  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    let applications$ = this.authorization.applications$.first();
    return applications$.map(apps => apps.some(app => app.modulePath === route.loadChildren));
  }
}
