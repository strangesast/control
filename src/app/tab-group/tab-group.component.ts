import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { GroupComponent } from '../group/group.component';

@Component({
  selector: 'app-tab-group',
  templateUrl: './tab-group.component.html',
  styleUrls: ['./tab-group.component.css'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color'
  }
})
export class TabGroupComponent extends GroupComponent implements OnInit {
  public activeTabIndex = 0;
  constructor(componentFactoryResolver: ComponentFactoryResolver) {
    super(componentFactoryResolver);
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
