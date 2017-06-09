import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';
import { SwitcherService } from '../switcher.service';

@Component({
  selector: 'app-topview',
  templateUrl: './topview.component.html',
  styleUrls: ['./topview.component.less'],
  animations: [routerTransition()],
  host: {
    '[@routerTransition]': 'expanded ? "expanded" : "default"'
  }
})
export class TopviewComponent implements OnInit {
  expanded = false;

  constructor(private s: SwitcherService) { }

  ngOnInit() {
    this.s.expanded.subscribe(e => this.expanded = e);
  }

}
