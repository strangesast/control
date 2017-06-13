import { Component, OnInit } from '@angular/core';
import { SwitcherComponent } from '../catalog/_components';
import { routerTransition } from '../catalog/_directives/router.animations';

@Component({
  selector: 'app-topview',
  templateUrl: './topview.component.html',
  styleUrls: ['./topview.component.less'],
  animations: [routerTransition()],
  host: {
    '[@routerTransition]': 'expanded ? "expanded" : "default"'
  }
})
export class TopviewComponent extends SwitcherComponent {}
