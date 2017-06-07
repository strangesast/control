import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
  tree: boolean = false;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.pluck('subsection').subscribe((subsection: string) => {
    });
  }

  logout() {}
}
