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
}
