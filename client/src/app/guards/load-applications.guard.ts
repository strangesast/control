import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Routes } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthorizationService } from '../services/authorization.service';
import { Application } from '../models';

import { ConfigurationService } from '../services/configuration.service';
import { LoginComponent } from '../components/login/login.component';
import { RegisterComponent } from '../components/register/register.component';
import { NotFoundComponent } from '../components/not-found/not-found.component';
import { LoginGuard } from '../guards/login.guard';
import { AuthGuard } from '../guards/auth.guard';

@Injectable()
export class LoadApplicationsGuard implements CanActivate {
  constructor(private authorization: AuthorizationService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      let url = state.url;
      console.log('load apps guarding...', url);

      // always return false to halt routing with this config. load new config. redirect to target path
      return this.authorization.userInitialized$.find(i => i).withLatestFrom(this.authorization.user$).flatMap(([_, user]) => {
        console.log('user', user);
        if (user) {
          return this.authorization.appsInitialized$.find(i => i).flatMap(() =>
            this.authorization.applications$.first().map(apps => {
              let routes = createRoutes(apps);
              this.router.resetConfig(routes);

              this.router.navigateByUrl(url);
              return false;
            })
          )
        } else {
          this.router.navigate(['/login'], { queryParams: { redirectUrl: url }});
          return Observable.of(false);
        }
      });
  }
}

function createRoutes(apps: Application[]): Routes {
  let canActivate = [ AuthGuard ]
  if (apps.length == 0) {
    throw new Error('at least one app required');
  }
  let children = apps.map(({ path, modulePath: loadChildren }) => ({ path, loadChildren, canActivate }));
  return [
    {
      path: '',
      resolve: { config: ConfigurationService },
      children: [ 
        { path: '', redirectTo: children[0].path, pathMatch: 'full' },
        { path: 'login',    component: LoginComponent,    canActivate: [ LoginGuard ] },
        { path: 'register', component: RegisterComponent, canActivate: [ LoginGuard ] },
        ...children,
        { path: '**', component: NotFoundComponent }
      ]
    }
  ];
}
