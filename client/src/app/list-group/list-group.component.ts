import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { GroupComponent } from '../group/group.component';
import { RegistrationService } from '../registration.service';

@Component({
  selector: 'app-list-group',
  templateUrl: './list-group.component.html',
  styleUrls: ['./list-group.component.less'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color'
  }
})
export class ListGroupComponent extends GroupComponent {
  activeListItem: number;

  constructor(componentFactoryResolver: ComponentFactoryResolver, registration: RegistrationService) {
    super(componentFactoryResolver, registration);
  }

  ngOnInit() {
  }

  buildAll() {
    if (this.activeListItem != null) {
      this.host.viewContainerRef.clear();
      let child = this.children[this.activeListItem];
      this.build(child);
    }
  }

  setActiveListItem(index) {
    this.activeListItem = index;
    this.buildAll()
  }
}
