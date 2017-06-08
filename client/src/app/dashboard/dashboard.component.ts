import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigurationService } from '../configuration.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
  host: {
    '[class.side]': 'side'
  }
})
export class DashboardComponent implements OnInit {
  title: string;
  side: boolean = false;

  constructor(private route: ActivatedRoute, private configuration: ConfigurationService) { }

  ngOnInit() {}

  logout() {
    this.configuration.logout();
  }
}
