import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SwitcherService } from './catalog/_services/switcher.service';
import { SwitcherComponent } from './catalog/_components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  host: {
    '[class.expanded]': 'expanded',
    '[class.hidden]': 'hidden'
  }
})
export class AppComponent extends SwitcherComponent {
  constructor(s: SwitcherService, private router: Router) {
    super(s);
  }
  hidden = false;

  ngOnInit() {
    super.ngOnInit();
    this.s.hidden.takeUntil(this.ngUnsubscribe).subscribe(e => this.hidden = e);
    this.router.events.filter(e => e instanceof NavigationEnd).pluck('url').map((url: string) => {
      if (url.startsWith('/login') || url.startsWith('/register')) {
        return true;
      }
      return false;

    }).takeUntil(this.ngUnsubscribe).subscribe(bool => this.hidden = bool);
  }

  toggle(override) {
    console.log('toggle');
    this.s.expanded.next(this.expanded = override != null ? override : !this.expanded);
  }
}
