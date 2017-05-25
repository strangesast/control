import { ViewChild, Component } from '@angular/core';
import { JsonInputComponent } from './json-input/json-input.component';

const INIT = {
  components: {
    "root": {
      "type": "tabGroup",
      "attributes": [
        {
          "name": "backgroundColor",
          "type": "string",
          "value": "#eee"
        },
        { "name": "children", "type": "array", "value": [ "group0", "group1" ]}
      ]
    },
    "group0": {
      "type": "group",
      "attributes": [
        { "name": "name", "type": "string", "value": "Group 1" },
        { "name": "children", "type": "array", "value": [ "toggleButton0" ]}
      ]
    },
    "group1": {
      "type": "group",
      "attributes": [
        { "name": "name", "type": "string", "value": "Group 2" }
      ]
    },
    "toggleButton0": {
      "type": "toggleButton",
      "attributes": [
        { "name": "label", "type": "string", "value": "Toggle Light in Room B" },
        { "name": "value", "type": "boolean", "value": false, id: "lightOn" },
        { "name": "color", "type": "string", "value": "purple" },
        { "name": "backgroundColor", "type": "string", "value": "white", "write": true }
      ]
    }
  },
  values: {
    temperature0: {
      type: "number",
      name: "Temperature Monitor 1"
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
