import { Input, Output, Component, OnInit, SimpleChange, EventEmitter } from '@angular/core';
import { GenericComponent } from '../generic/generic.component';
import { Subject, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-numeric-input',
  templateUrl: './numeric-input.component.html',
  styleUrls: ['./numeric-input.component.css'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color'
  }
})
export class NumericInputComponent extends GenericComponent {
  @Input() read: boolean = true;
  @Input() write: boolean = false;
  @Input() label: string;

  constructor() {
    super();
  }

  @Input() get value() {
    return this.currentValue;
  }
  set value(value) {
    if (value instanceof Subject) {
      if (this.valueSubscription) this.valueSubscription.unsubscribe();
      this.valueSubscription = (this.valueSubject = value).subscribe(val => {
        this.currentValue = val.value;
      })
    } else {
      this.valueSubject.next({ value });
      this.currentValue = value;
      //Object.assign(this.currentValue, value); // not ideal
    }
  }
}
