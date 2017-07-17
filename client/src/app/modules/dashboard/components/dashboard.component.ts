import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizationService } from '../../../services/authorization.service';
import { routerTransition } from '../../catalog/directives/router.animations';
import { SwitcherComponent } from '../../catalog/components/switcher/switcher.component';
import { SwitcherService } from '../../catalog/services/switcher.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
  animations: [routerTransition()],
  host: {
    '[@routerTransition]': 'expanded ? "expanded" : "default"'
  }
})
export class DashboardComponent extends SwitcherComponent {
  title: string;

  constructor(
    s: SwitcherService,
    private router: Router,
    private authorization: AuthorizationService
  ) {
    super(s);
  }

  logout() {
    this.authorization.logout()//.subscribe(() => this.router.navigate(['/login']));
  }
}
