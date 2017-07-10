import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SwitcherService {
  hidden = new BehaviorSubject(true);
  expanded = new BehaviorSubject(false);
  applications = new BehaviorSubject([]);

  constructor() {
    console.log('new service');
  }

}
