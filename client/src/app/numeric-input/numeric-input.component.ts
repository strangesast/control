import { Input, Output, Component, OnInit, EventEmitter, ComponentFactoryResolver } from '@angular/core';
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
  @Input() writable: boolean = false;

  // label
  @Input() label: string;

  // value
  @Input() value: number;
  @Output() valueChange: EventEmitter<number> = new EventEmitter();

  change(value) {
    this.value = value;
    this.valueChange.emit(value);
  }
}
