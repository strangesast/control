import { Component, OnInit } from '@angular/core';
//import { routerTransition } from '../router.animations';
//import { SwitcherService } from '../switcher.service';

@Component({
  selector: 'app-thermostat',
  templateUrl: './thermostat.component.html',
  styleUrls: ['./thermostat.component.less'],
  //animations: [routerTransition()],
  host: {
    //'[@routerTransition]': 'expanded ? "expanded" : "default"'
  }
})
export class ThermostatComponent implements OnInit {
  expanded = false;

  // to be removed
  temperature = 70
  setPoint = 75

  //constructor(private s: SwitcherService) { }

  ngOnInit() {
    //this.s.expanded.subscribe(e => this.expanded = e);

    setInterval(() => {
      if (Math.abs(this.temperature - this.setPoint) > 0.01) {
        this.temperature += (this.setPoint - this.temperature)*0.5;
        this.temperature = Math.floor(this.temperature*100)/100;
      }
    }, 1000);
  }

}
