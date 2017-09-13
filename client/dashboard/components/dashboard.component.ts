import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizationService } from '../../app/services/authorization.service';
import { routerTransition } from '../../catalog/directives/router.animations';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
  animations: [routerTransition()],
  host: {
    '[@routerTransition]': 'expanded ? "expanded" : "default"'
  }
})
export class DashboardComponent {
  title: string;

  constructor(
    private router: Router,
    private authorization: AuthorizationService
  ) {}

  logout() {
    this.authorization.logout()//.subscribe(() => this.router.navigate(['/login']));
  }
}
