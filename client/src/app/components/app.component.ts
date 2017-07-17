import { Component } from '@angular/core';
import { Routes, Router, NavigationEnd } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import * as Models from '../models';

import { ConfigurationService } from '../services/configuration.service';


@Component({
  selector: 'app-root',
  template: `
  <app-switcher [disabled]="router.isActive('/login', true)" [(active)]="switcherActive" [index]="switcherIndex" (indexChange)="indexChanged($event)">
    <div class="header">
      <span>Top (header)</span>
    </div>
    <router-outlet></router-outlet>
    <div class="footer">
      <div class="title" (click)="toggleSwitcher()">
        <span>Applications</span>
        <span class="icon fa fa-fw fa-arrow-up" [class.active]="switcherActive"></span>
      </div>
      <div class="flex-list">
        <div *ngFor="let app of applications$ | async">
          <a routerLinkActive="active" [routerLink]="app.path">{{ app.name }}</a>
        </div>
      </div>
    </div>
  </app-switcher>
  `,
  styleUrls: ['./app.component.less'],
})
export class AppComponent {

  routeUpdatesSub: Subscription;

  switcherActive: boolean = false;
  switcherIndex: number = -1;

  applications$: Observable<Partial<Models.Application>[]>

  loading$: Observable<boolean>;

  constructor(config: ConfigurationService, public router: Router) {
    this.applications$ = config.applications$;

    // should look for user update (wont update until 1 app)
    this.loading$ = this.applications$.map(apps => apps.length == 0)
      .distinctUntilChanged()
      .takeWhile(l => l);

    let ready$ = this.loading$.ignoreElements().concat(Observable.of(true));

    // create new routes each time applications is updated (probably just once)
    //this.routeUpdatesSub = this.applications$
    //  .skipUntil(ready$)
    //  .map(createRoutesFromApps)
    //  .subscribe(routes => {
    //    router.resetConfig(routes);
    //  });
  }

  toggleSwitcher(): void {
    this.switcherActive = !this.switcherActive;
  }

  indexChanged(index) {
  }

  ngOnDestroy() {
    this.routeUpdatesSub.unsubscribe();
  }
}

/*
function createRoutesFromApps (apps) {
  // parse applications, create route for each
  if (apps.length < 1) throw new Error('at least one application needed');

  let children: Routes = apps.map((app: Models.Application, i: number) => {
    let { path, _id, modulePath: loadChildren } = app;

    // canLoad may be unnecessary
    return {
      path,
      loadChildren,
      canLoad: [ AuthGuard ],
      animation: { value: _id, index: i }
    };
  });

  // the above should be moved to separate module, separate router
  children.push({ path: 'login', component: LogInComponent });
  children.push({ path: 'register', component: RegisterComponent });
  children.push({ path: '', redirectTo: '/' + children[0].path, pathMatch: 'full' });
  children.push({ path: '', component: DummyComponent, canActivate: [AuthGuard, DefaultAppGuard] });
  children.push({ path: '**', component: NotFoundComponent });

  return [{ path: '', resolve: { configuration: ConfigurationService }, children }];
}
*/
