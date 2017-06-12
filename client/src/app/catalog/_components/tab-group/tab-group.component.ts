import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { GroupComponent } from '../group/group.component';
import { RegistrationService } from '../../_services/registration.service';

@Component({
  selector: 'app-tab-group',
  templateUrl: './tab-group.component.html',
  styleUrls: ['./tab-group.component.less'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color'
  }
})
export class TabGroupComponent extends GroupComponent implements OnInit {
  public activeTabIndex = 0;
  constructor(componentFactoryResolver: ComponentFactoryResolver, registration: RegistrationService) {
    super(componentFactoryResolver, registration);
  }
  buildAll() {
    this.host.viewContainerRef.clear();
    this.build(this.children[this.activeTabIndex]);
  }
  setTab(index) {
    this.activeTabIndex = Math.min((this.children && this.children.length) || 0, index);
    this.buildAll();
  }
}
