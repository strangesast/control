import { Component, OnInit, OnDestroy } from '@angular/core';
import { routerTransition } from '../../directives/router.animations';
import { SwitcherService } from '../../services/switcher.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-switcher',
  templateUrl: './switcher.component.html',
  styleUrls: ['./switcher.component.less'],
  host: {
    '[@routerTransition]': 'expanded ? "expanded" : "default"'
  }
})
export class SwitcherComponent implements OnInit, OnDestroy {
  expanded: boolean;
  ngUnsubscribe = new Subject();

  constructor(protected s: SwitcherService) { }

  ngOnInit() {
    this.s.expanded.takeUntil(this.ngUnsubscribe).subscribe(e => this.expanded = e);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
