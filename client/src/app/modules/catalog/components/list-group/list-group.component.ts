import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { GroupComponent } from '../group/group.component';
import { RegistrationService } from '../../services/registration.service';

@Component({
  selector: 'app-list-group',
  templateUrl: './list-group.component.html',
  styleUrls: ['./list-group.component.less'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color',
    '[class.child-active]': 'activeListItem > -1'
  }
})
export class ListGroupComponent extends GroupComponent {
  activeListItem: number = -1;

  constructor(componentFactoryResolver: ComponentFactoryResolver, registration: RegistrationService) {
    super(componentFactoryResolver, registration);
  }

  ngOnInit() {
  }

  buildAll() {
    if (this.activeListItem > -1) {
      this.host.viewContainerRef.clear();
      let child = this.children[this.activeListItem];
      this.build(child);
    }
  }

  setActiveListItem(index) {
    this.activeListItem = this.activeListItem != index ? index : -1;
    this.buildAll()
  }
}
