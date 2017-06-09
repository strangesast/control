import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SwitcherService } from './switcher.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  host: {
    '[class.expanded]': 'expanded',
    '[class.hidden]': 'hidden'
  }
})
export class AppComponent {
  constructor(private s: SwitcherService, private router: Router) {}
  applications = [];
  expanded = false;
  hidden = false;

  ngOnInit() {
    this.s.applications.subscribe(a => this.applications = a);
    this.s.expanded.subscribe(a => this.expanded = a);
    this.s.hidden.subscribe(a => this.hidden = a);
    this.router.events.filter(e => e instanceof NavigationEnd).pluck('url').map((url: string) => {
      if (url.startsWith('/login') || url.startsWith('/register')) {
        return true;
      }
      return false;

    }).subscribe(bool => this.hidden = bool);
  }

  toggle(override) {
    this.s.expanded.next(this.expanded = override != null ? override : !this.expanded);
  }
}
