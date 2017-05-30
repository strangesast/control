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
}
