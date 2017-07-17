import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthorizationService } from '../services/authorization.service';

@Injectable()
export class DefaultGuard implements CanActivate {
  constructor(private authorization: AuthorizationService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return this.authorization.applications$.skipWhile(apps => !apps).first().flatMap(apps => {
      console.log('apps', apps);
      let app = apps[0];
      this.router.navigateByUrl(app.path);
      return Observable.of(false);

    });
  }
}
