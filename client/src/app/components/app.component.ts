import { Component } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { ConfigurationService } from '../services/configuration.service';
import { AuthorizationService } from '../services/authorization.service';

@Component({
  selector: 'app-root',
  template: `
  <div class="loading" *ngIf="loading">
    <div>
      <span>Loading User...</span>
      <span class="fa fa-1x fa-fw" [ngClass]="(userReady$ | async) ? 'fa-check' : 'fa-circle-o-notch fa-spin'"></span>
    </div>
    <div>
      <span>Loading Apps...</span>
      <span class="fa fa-1x fa-fw" [ngClass]="(appsReady$ | async) ? 'fa-check' : 'fa-circle-o-notch fa-spin'"></span>
    </div>
  </div>
  <router-outlet (activate)="onActivate()"></router-outlet>
  `,
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  loading: boolean = true;
  userReady$: Observable<boolean>;
  appsReady$: Observable<boolean>;

  constructor(private auth: AuthorizationService, public router: Router, private config: ConfigurationService) {
    this.userReady$ = auth.userInitialized$;
    this.appsReady$ = auth.appsInitialized$;
  }

  onActivate() {
    this.loading = false;
  }
}
