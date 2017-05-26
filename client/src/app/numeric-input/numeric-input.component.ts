import { Input, Output, Component, OnInit, SimpleChange, EventEmitter } from '@angular/core';
import { GenericComponent } from '../generic/generic.component';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-numeric-input',
  templateUrl: './numeric-input.component.html',
  styleUrls: ['./numeric-input.component.css'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color'
  }
})
export class NumericInputComponent extends GenericComponent implements OnInit {
  @Input() read: boolean = true;
  @Input() write: boolean = false;
  @Input() label: string;
  currentValue: any;
  valueSubscription: Subscription;
  @Output() valueChange = new EventEmitter();
  @Input() get value() {
    return this.currentValue;
  }
  set value(value) {
    console.log('value', value);
    if (this.valueSubscription) {
      this.valueSubscription.unsubscribe();
    }
    if (value instanceof Observable) {
      this.valueSubscription = value.subscribe(val => this.currentValue = val);
    } else {
      this.currentValue = value;
    }
  }

  constructor() {
    super();
  }

  ngOnInit() {
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    console.log('changes', changes);
  }
}
