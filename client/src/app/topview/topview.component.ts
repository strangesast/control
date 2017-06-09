import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { SwitcherService } from '../switcher.service';

@Component({
  selector: 'app-topview',
  templateUrl: './topview.component.html',
  styleUrls: ['./topview.component.less'],
  animations: [routerTransition()],
  host: {
    '[@routerTransition]': 'expanded ? "expanded" : "default"',
    '[class.loading]': 'loading'
  }
})
export class TopviewComponent implements OnInit {
  expanded = false;
  loading = true;

  constructor(private s: SwitcherService) { }

  ngOnInit() {
    this.s.expanded.subscribe(e => this.expanded = e);
    setTimeout(() => this.loading = false, 1000);
  }

}
