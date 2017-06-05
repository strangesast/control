import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import entryComponents from '../entry-components';
import { GroupComponent } from '../group/group.component';

//GroupComponent,
//ToggleButtonComponent,
//TabGroupComponent,
//NumericInputComponent,
//GraphComponent,
//GaugeComponent,
//ListGroupComponent,
//ThermostatComponent

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css']
})
export class ExampleComponent implements OnInit {
  currentExample = null;
  temperature = 70
  setPoint = 75
  groupName = 'group name'
  groupLayout = 'horizontal'
  groupChildren = []

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    console.log('new');
    this.route.params.subscribe(({ example }) => {
      this.currentExample = example;
    });
    setInterval(() => {
      if (Math.abs(this.temperature - this.setPoint) > 0.01) {
        this.temperature += (this.setPoint - this.temperature)*0.5;
        this.temperature = Math.floor(this.temperature*100)/100;
      }
    }, 1000);
  }

  addGroupChild () {
    this.groupChildren = [ ...this.groupChildren, { Component: GroupComponent, attributes: [{ name: 'name', value: `Child ${ this.groupChildren.length+1 }` }]}];
  }

}
