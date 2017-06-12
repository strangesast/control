import {
  Input,
  OnInit,
  ViewChild,
  Component,
  HostBinding,
  SimpleChange,
  ViewContainerRef,
  ComponentFactoryResolver
} from '@angular/core';
import { GroupDirective } from '../../_directives/group.directive';
import { GenericComponent } from '../generic/generic.component';
import { RegistrationService } from '../../_services/registration.service';

import { TabGroupComponent } from '../tab-group/tab-group.component';
import { ToggleButtonComponent } from '../toggle-button/toggle-button.component';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.less'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color',
    '[style.flex-direction]': 'layout == "vertical" ? "column" : "row"'
  }
})
export class GroupComponent extends GenericComponent implements OnInit {
  @ViewChild(GroupDirective) host: GroupDirective;
  @Input() layout: string;
  @Input() children: any[] = [];
  @HostBinding('attr.name') @Input() name: string;

  constructor(public componentFactoryResolver: ComponentFactoryResolver, public registration: RegistrationService) {
    super();
  }

  ngOnInit() {
    this.buildAll();
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
    let attributeStreams = this.registration.register(attributes);
    for (let { name } of attributes) {
      (<GenericComponent>componentRef.instance)[name] = attributeStreams[name];
    }
    return componentRef;
  }

  ngOnChanges(changes) {
    if (changes.children) {
      this.buildAll();
    }
  }
}
