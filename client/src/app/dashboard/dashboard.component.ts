import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigurationService } from '../configuration.service';
import { routerTransition } from '../router.animations';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
  animations: [routerTransition()],
  host: {
    '[@routerTransition]': ''
  }
})
export class DashboardComponent implements OnInit {
  title: string;

  constructor(private router: Router, private configuration: ConfigurationService) { }

  ngOnInit() {}

  logout() {
    this.configuration.logout();
    this.router.navigate(['/login']);
  }
}
