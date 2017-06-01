import { Input, Output, Component, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-generic',
  templateUrl: './generic.component.html',
  styleUrls: ['./generic.component.css'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color'
  }
})
export class GenericComponent implements OnDestroy {
  @Input() backgroundColor: string;
  @Input() color: string = '#000';
  valueSubscription: Subscription;
  valueSubject: Subject<any>;
  currentValue: any;
  @Input() get value() {
    return this.currentValue;
  }
  set value(value) {
    if (value instanceof Subject) {
      if (this.valueSubscription) this.valueSubscription.unsubscribe();
      this.valueSubscription = (this.valueSubject = value).subscribe(val => {
        this.currentValue = val;
      })
    } else {
      this.valueSubject.next(value);
      Object.assign(this.currentValue, value); // not ideal
    }
  }

  ngOnDestroy() {
    if (this.valueSubscription) this.valueSubscription.unsubscribe();
  }
}
