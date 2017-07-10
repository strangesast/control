import { Component, OnInit } from '@angular/core';
import { SwitcherComponent } from '../../catalog/components';
import { routerTransition } from '../../catalog/directives/router.animations';

@Component({
  selector: 'app-energy',
  templateUrl: './energy.component.html',
  styleUrls: ['./energy.component.less'],
  animations: [routerTransition()],
  host: {
    '[@routerTransition]': 'expanded ? "expanded" : "default"'
  }
})
export class EnergyComponent extends SwitcherComponent {}
