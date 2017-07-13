import { Component } from '@angular/core';
import { Routes, Router, NavigationEnd } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import * as Models from '../models';

import {
  LogInComponent,
  RegisterComponent,
  DummyComponent,
  NotFoundComponent
} from '../components';

import { AuthGuard } from '../guards';

import { ConfigurationService } from '../services/configuration.service';


@Component({
  selector: 'app-root',
  template: `
<app-switcher [disabled]="switcherDisabled$ | async" [(active)]="switcherActive" [index]="switcherIndex" (indexChange)="indexChanged($event)">
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

  readonly switcherDisabledUrls = ['/login'];
  switcherDisabled$: Observable<boolean>;

  switcherActive: boolean = false;
  switcherIndex: number = -1;

  applications$: Observable<Partial<Models.Application>[]>

  loading$: Observable<boolean>;

  constructor(config: ConfigurationService, router: Router) {

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

    let urls$ = router.events
      // end of router nav
      .filter(e => e instanceof NavigationEnd)
      // check url
      .pluck('url')
      .do(console.log.bind(console, 'url:'))

    // disable switcher for some urls
    this.switcherDisabled$ = urls$
      // disabled here?
      .map((url: string) => this.isDisabledUrl(url))
      // is there more than one application for this user?
      .combineLatest(this.applications$.map(apps => apps.length < 2))
      .map(([a, b]) => a || b)
      .distinctUntilChanged()
  }

  toggleSwitcher(): void {
    this.switcherActive = !this.switcherActive;
  }

  isDisabledUrl(url: string): boolean {
    return this.switcherDisabledUrls.some(_url => url.startsWith(_url))
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
