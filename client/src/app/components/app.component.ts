import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { SwitcherService } from '../modules/catalog/services/switcher.service';
import { SwitcherComponent } from '../modules/catalog/components';
import { ConfigurationService } from '../services/configuration.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  host: {
    '[class.expanded]': 'expanded',
    '[class.hidden]': 'hidden$ | async'
  }
})
export class AppComponent extends SwitcherComponent {
  constructor(private configuration: ConfigurationService, s: SwitcherService, private router: Router) {
    super(s);
  }
  hidden$: Observable<boolean>;

  ngOnInit() {
    this.hidden$ = this.s.hidden$;
    this.router.events.filter(e => e instanceof NavigationEnd).pluck('url').map((url: string) => {
      if (url.startsWith('/login') || url.startsWith('/register')) {
        return true;
      }
      return false;

    })
    .subscribe(this.s.hidden$)
  }

  toggle(override?:boolean): void {
    this.s.expanded$.next(this.expanded = override != null ? override : !this.expanded);
  }
}
