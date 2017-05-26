import { ViewChild, Component } from '@angular/core';
import { JsonInputComponent } from './json-input/json-input.component';

const INIT = {
  components: {
    root: {
      type: 'TabGroupComponent',
      attributes: [
        {
          name: 'backgroundColor',
          type: 'string',
          value: '#eee'
        },
        { name: 'children', type: 'array', value: [ 'group0', 'group1' ]}
      ]
    },
    group0: {
      type: 'GroupComponent',
      attributes: [
        { name: 'name', type: 'string', value: 'Group 1' },
        { name: 'children', type: 'array', value: [ 'numericInput0', 'numericInput1' ]}
      ]
    },
    group1: {
      type: 'GroupComponent',
      attributes: [
        { name: 'name', type: 'string', value: 'Group 2' },
        { name: 'children', type: 'array', value: ['gaugeComponent0', 'graphComponent0', 'numericInput1'] }
      ]
    },
    numericInput0: {
      type: 'NumericInputComponent',
      attributes: [
        { name: 'label', type: 'string', value: 'Temperature in Room B' },
        { name: 'value', type: 'number', id: 'temperature' },
        { name: 'color', type: 'string', value: 'purple' },
        { name: 'backgroundColor', type: 'string', value: 'white', write: true }
      ]
    },
    numericInput1: {
      type: 'NumericInputComponent',
      attributes: [
        { name: 'label', type: 'string', value: 'Set Point 1' },
        { name: 'value', type: 'number', id: 'setPoint' },
        { name: 'color', type: 'string', value: 'purple' },
        { name: 'backgroundColor', type: 'string', value: 'white' },
        { name: 'write', type: 'boolean', value: true }
      ]
    },
    graphComponent0: {
      type: 'GraphComponent',
      attributes: [
        { name: 'value', type: 'number', id: 'temperature' }
      ]
    },
    gaugeComponent0: {
      type: 'GaugeComponent',
      attributes: [
        { name: 'value', type: 'number', id: 'temperature' }
      ]
    }

  },
  values: {
    temperature: {
      type: 'number',
      name: 'Temperature Monitor 1'
    },
    setPoint: {
      type: 'number',
      name: 'Set Point 1'
    }
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public json = INIT;
}
