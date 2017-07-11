import { Component, OnInit, OnDestroy } from '@angular/core';
import { routerTransition } from '../../directives/router.animations';
import { SwitcherService } from '../../services/switcher.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-switcher',
  templateUrl: './switcher.component.html',
  styleUrls: ['./switcher.component.less'],
  host: {
    '[@routerTransition]': '(expanded$ | async) ? "expanded" : "default"'
  }
})
export class SwitcherComponent {
  expanded$: Observable<boolean>;

  constructor(protected s: SwitcherService) {
    this.expanded$ = this.s.expanded$;
  }
}
