import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigurationService } from '../_services/configuration.service';
import { routerTransition } from '../catalog/_directives/router.animations';
import { SwitcherComponent } from '../catalog/_components/switcher/switcher.component';
import { SwitcherService } from '../catalog/_services/switcher.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
  animations: [routerTransition()],
  host: {
    '[@routerTransition]': 'expanded ? "expanded" : "default"',
    '[class.expanded]': 'expanded'
  }
})
export class DashboardComponent extends SwitcherComponent implements OnInit {
  title: string;

  constructor(
    s: SwitcherService,
    private router: Router,
    private configuration: ConfigurationService
  ) {
    super(s);
  }

  logout() {
    this.configuration.logout();
    this.router.navigate(['/login']);
  }
}
