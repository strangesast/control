import {
  Input,
  Output,
  HostBinding,
  EventEmitter,
  Component,
  OnInit
} from '@angular/core';

import { activeAnim, indexAnim } from './animation';

@Component({
  selector: 'app-switcher',
  templateUrl: './switcher.component.html',
  styleUrls: ['./switcher.component.less'],
  animations: [ indexAnim, activeAnim ]
})
export class SwitcherComponent {
  // animation binding for page / tray animations
  @HostBinding('@activeAnim') get activeText() {
    return this.active ? 'active' : 'inactive'
  }

  // should header/footer be hidden (i.e. for login/register page)
  @HostBinding('class.disabled')
  @Input() disabled: boolean = true;

  // control zoom-out.  header/footer expanded on "active"
  @HostBinding('class.active')
  public activeValue: boolean = false;

  // allow two-way binding on 'active' property
  @Output() public activeChange: EventEmitter<boolean> = new EventEmitter();

  @Input() get active() {
    return this.activeValue;
  }

  set active(val) {
    this.activeValue = val;
    this.activeChange.emit(val);
  }

  public indexValue: number = -1;
  @Output() public indexChange: EventEmitter<number> = new EventEmitter();

  // which index is active
  @HostBinding('@indexAnim')
  get indexValueText() {
    switch(this.index) {
      case 0:
        return 'zero';
      case 1:
        return 'one';
      case 2:
        return 'two';
      case 3:
        return 'three';
      case 4:
        return 'four';
      default:
        return '';
    }
  }

  @Input() get index() {
    return this.indexValue;
  }

  set index(val) {
    this.indexValue = val;
    this.indexChange.emit(val);
  }

  constructor() { }

  // used for shade clicks
  deactivate() {
    this.active = false;
  }
}
