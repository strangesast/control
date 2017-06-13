import { Component, OnInit } from '@angular/core';
import { SwitcherComponent } from '../catalog/_components';
import { routerTransition } from '../catalog/_directives/router.animations';

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
