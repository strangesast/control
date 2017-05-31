import {
  Input,
  OnInit,
  ViewChild,
  Component,
  SimpleChange,
  ViewContainerRef,
  ComponentFactoryResolver
} from '@angular/core';
import { GroupDirective } from '../group.directive';
import { GenericComponent } from '../generic/generic.component';
import { RegistrationService } from '../registration.service';

import { TabGroupComponent } from '../tab-group/tab-group.component';
import { ToggleButtonComponent } from '../toggle-button/toggle-button.component';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color'
  }
})
export class GroupComponent extends GenericComponent implements OnInit {
  @ViewChild(GroupDirective) host: GroupDirective;
  @Input() layout: string;
  @Input() children: any[];
  @Input() name: string;

  constructor(private componentFactoryResolver: ComponentFactoryResolver, public registration: RegistrationService) {
    super()
  }

  ngOnInit() {
    if (this.children) {
      this.buildAll();
    }
  }

  buildAll(...args) {
    this.host.viewContainerRef.clear();
    for (let child of this.children) {
      this.build(child);
    }
  }

  build(obj, index?) {
    let { Component, attributes } = obj;
    let factory = this.componentFactoryResolver.resolveComponentFactory(Component);
    let { viewContainerRef } = this.host;
    let componentRef = viewContainerRef.createComponent(factory, index);
    for (let attr of attributes) {
      // assert correct type for attribute
      (<GenericComponent>componentRef.instance)[attr.name] = attr.id ? this.registration.register(attr) : attr.value;
    }
    return componentRef;
  }

  static toJSON() {
    return 'group';
  }
}
