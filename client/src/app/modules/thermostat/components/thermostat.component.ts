import { Component, OnInit } from '@angular/core';
import { SwitcherComponent } from '../../catalog/components';
import { routerTransition } from '../../catalog/directives/router.animations';

@Component({
  selector: 'app-thermostat',
  templateUrl: './thermostat.component.html',
  styleUrls: ['./thermostat.component.less'],
  animations: [routerTransition()],
  host: {
    '[@routerTransition]': 'expanded ? "expanded" : "default"',
    '[class.expanded]': 'expanded'
  }
})
export class ThermostatComponent extends SwitcherComponent implements OnInit {
  // to be removed
  temperature = 70
  setPoint = 75

  ngOnInit() {
    setInterval(() => {
      if (Math.abs(this.temperature - this.setPoint) > 0.01) {
        this.temperature += (this.setPoint - this.temperature)*0.5;
        this.temperature = Math.floor(this.temperature*100)/100;
      }
    }, 1000);
  }

}
