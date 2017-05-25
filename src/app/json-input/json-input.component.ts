import { SimpleChange, Component, Output } from '@angular/core';

const INIT = JSON.stringify({
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
    "id": "toggleButton0",
    "type": "toggleButton",
    "attributes": [
      { "name": "label", "type": "string", "value": "Toggle Light in Room B" },
      { "name": "value", "type": "boolean", "value": false, id: "lightOn" },
      { "name": "color", "type": "string", "value": "purple" },
      { "name": "backgroundColor", "type": "string", "value": "white", "write": true }
    ]
  }
}, null, 2);

@Component({
  selector: 'app-json-input',
  templateUrl: './json-input.component.html',
  styleUrls: ['./json-input.component.css']
})
export class JsonInputComponent {
  @Output() public json: any = {};
  public text: string = INIT;
  public valid: boolean = true;

  constructor() { }

  ngOnInit() {
    this.change();
  }

  change() {
    try {
      this.json = JSON.parse(this.text)
      this.valid = true;
    } catch (e) {
      this.valid = false;
    }
  }
}
