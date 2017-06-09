import { Component } from '@angular/core';
import { SwitcherService } from './switcher.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
  host: {
    '[class.expanded]': 'expanded'
  }
})
export class AppComponent {
  constructor(private s: SwitcherService) {}
  applications = [];
  expanded = false;

  ngOnInit() {
    this.s.applications.subscribe(a => this.applications = a);
  }

  toggle(override) {
    this.s.expanded.next(this.expanded = override != null ? override : !this.expanded);
  }
}
