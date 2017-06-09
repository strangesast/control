import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigurationService } from '../configuration.service';
import { routerTransition } from '../router.animations';
import { SwitcherService } from '../switcher.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
  animations: [routerTransition()],
  host: {
    '[@routerTransition]': 'expanded ? "expanded" : "default"'
  }
})
export class DashboardComponent implements OnInit {
  title: string;
  expanded = false;

  constructor(private s: SwitcherService, private router: Router, private configuration: ConfigurationService) { }

  ngOnInit() {
    this.s.expanded.subscribe(e => this.expanded = e);
  }

  logout() {
    this.configuration.logout();
    this.router.navigate(['/login']);
  }
}
