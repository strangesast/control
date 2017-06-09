import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SwitcherService {
  expanded = new BehaviorSubject(false);
  applications = new BehaviorSubject([]);

  constructor() { }

}
