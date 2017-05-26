import { Input, Output, Component, OnInit, EventEmitter } from '@angular/core';
import { Observable, Subscription, ReplaySubject } from 'rxjs';

@Component({
  selector: 'app-generic',
  templateUrl: './generic.component.html',
  styleUrls: ['./generic.component.css'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color'
  }
})
export class GenericComponent {
  @Input() backgroundColor: string;
  @Input() color: string = '#000';
  valueStream = new ReplaySubject<Observable<any>>(1);
  currentValue: any;
  valueSubscription: Subscription;
  @Output() valueChange = new EventEmitter();
  @Input() get value() {
    return this.currentValue;
  }
  set value(value) {
    this.valueStream.next(value instanceof Observable ? value : Observable.of(this.currentValue))
  }
  ngOnInit() {
    this.valueSubscription = this.valueStream.switchMap(stream => stream).subscribe(val => this.currentValue = val);
  }
}
