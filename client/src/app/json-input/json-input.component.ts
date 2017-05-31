import { EventEmitter, SimpleChange, Component, Input, Output } from '@angular/core';
import { RegistrationService } from '../registration.service';

@Component({
  selector: 'app-json-input',
  templateUrl: './json-input.component.html',
  styleUrls: ['./json-input.component.css']
})
export class JsonInputComponent {
  jsonValue;
  text: string;
  templates: any[];
  public valid: boolean = true;
  @Output() jsonChange = new EventEmitter();
  @Input() get json(): any {
    return this.jsonValue;
  }

  set json(val) {
    this.jsonValue = val;
    this.text = JSON.stringify(this.jsonValue, null, 2);
    this.jsonChange.emit(this.jsonValue);
    this.registration.template = this.jsonValue;
  }

  constructor(private registration: RegistrationService) { }

  ngOnInit() {
    try {
      this.templates = JSON.parse(localStorage.getItem('templates')) || [];
    } catch (e) {
      this.templates = [];
    }
    this.registration.registeredTemplate.subscribe(template => {
      this.json = template;
    });
  }

  change() {
    try {
      this.json = JSON.parse(this.text)
      this.valid = true;
    } catch (e) {
      this.valid = false;
    }
  }

  saveTemplate(name) {
    if (this.valid) {
      let template = this.json;
      let existing = this.templates.find(({name: _name}) => name == _name);
      if (existing) {
        existing.template = template;
      } else {
        this.templates.push({ name, template });
      }
      localStorage.setItem('templates', JSON.stringify(this.templates))
    }
  }

  removeTemplate(index) {
    let template = this.templates[index];
    if (template) {
      this.templates.splice(index, 1);
      localStorage.setItem('templates', JSON.stringify(this.templates));
    }
  }

  loadTemplate(index) {
    let template = this.templates[index];
    if (template) {
      this.json = template.template;
    }
  }

  loadDefault() {
    this.json = {
      "components": {
        "root": {
          "type": "ListGroupComponent",
          "attributes": [
            {
              "name": "backgroundColor",
              "type": "string",
              "value": "#eee"
            },
            {
              "name": "children",
              "type": "array",
              "value": [
                "group0",
                "group1",
                "group2",
                "group3"
              ]
            }
          ]
        },
        "group0": {
          "type": "GroupComponent",
          "attributes": [
            {
              "name": "name",
              "type": "string",
              "value": "Group 1"
            },
            {
              "name": "children",
              "type": "array",
              "value": [
                "numericInput0",
                "numericInput1"
              ]
            }
          ]
        },
        "group1": {
          "type": "GroupComponent",
          "attributes": [
            {
              "name": "name",
              "type": "string",
              "value": "Group 2"
            },
            {
              "name": "children",
              "type": "array",
              "value": [
                "thermostatComponent0",
                "graphComponent0",
                "numericInput1"
              ]
            }
          ]
        },
        "group2": {
          "type": "GroupComponent",
          "attributes": [
            {
              "name": "name",
              "type": "string",
              "value": "Group 3"
            },
            {
              "name": "children",
              "type": "array",
              "value": [
                "thermostatComponent0",
                "numericInput1"
              ]
            }
          ]
        },
        "group3": {
          "type": "GroupComponent",
          "attributes": [
            {
              "name": "name",
              "type": "string",
              "value": "Group 4"
            }
          ]
        },
        "numericInput0": {
          "type": "NumericInputComponent",
          "attributes": [
            {
              "name": "label",
              "type": "string",
              "value": "Temperature in Room B"
            },
            {
              "name": "value",
              "type": "number",
              "id": "temperature"
            },
            {
              "name": "color",
              "type": "string",
              "value": "purple"
            },
            {
              "name": "backgroundColor",
              "type": "string",
              "value": "white",
              "write": true
            }
          ]
        },
        "numericInput1": {
          "type": "NumericInputComponent",
          "attributes": [
            {
              "name": "label",
              "type": "string",
              "value": "Set Point 1"
            },
            {
              "name": "value",
              "type": "number",
              "id": "setPoint"
            },
            {
              "name": "color",
              "type": "string",
              "value": "purple"
            },
            {
              "name": "backgroundColor",
              "type": "string",
              "value": "white"
            },
            {
              "name": "write",
              "type": "boolean",
              "value": true
            }
          ]
        },
        "graphComponent0": {
          "type": "GraphComponent",
          "attributes": [
            {
              "name": "value",
              "type": "number",
              "id": "temperature"
            }
          ]
        },
        "thermostatComponent0": {
          "type": "ThermostatComponent",
          "attributes": [
            {
              "name": "setPoint",
              "type": "number",
              "id": "setPoint"
            },
            {
              "name": "temperature",
              "type": "number",
              "id": "temperature"
            }
          ]
        }
      },
      "values": {
        "temperature": {
          "type": "number",
          "name": "Temperature Monitor 1"
        },
        "setPoint": {
          "type": "number",
          "name": "Set Point 1"
        }
      }
    }
  }
}
