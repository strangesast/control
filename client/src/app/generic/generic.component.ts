import {
  Input,
  Output,
  Component,
  OnInit,
  EventEmitter,
  OnDestroy,
  ComponentFactoryResolver
} from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { RegistrationService } from '../registration.service';

@Component({
  selector: 'app-generic',
  templateUrl: './generic.component.html',
  styleUrls: ['./generic.component.less'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color'
  }
})
export class GenericComponent implements OnDestroy {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor() {}

  ngOnDestroy() {
    // from https://stackoverflow.com/a/41177163
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
