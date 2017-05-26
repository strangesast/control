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
export class NumericInputComponent extends GenericComponent {
  @Input() read: boolean = true;
  @Input() write: boolean = false;
  @Input() label: string;

  constructor() {
    super();
  }
}
