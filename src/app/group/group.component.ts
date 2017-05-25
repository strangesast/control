import { ComponentFactoryResolver, ViewChild, Input, Component, OnInit, AfterViewInit, ViewContainerRef, SimpleChange } from '@angular/core';
import { GroupDirective } from '../group.directive';
import { GenericComponent } from '../generic/generic.component';

import { ToggleButtonComponent } from '../toggle-button/toggle-button.component';

const componentNameMap = {
  'toggleButton': ToggleButtonComponent
}

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color'
  }
})
export class GroupComponent implements OnInit, AfterViewInit, GenericComponent {
  @ViewChild(GroupDirective) host: GroupDirective;
  @Input() layout: string;
  @Input() backgroundColor: string;
  @Input() color: string = '#000';
  @Input() children: any[];

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit() {
    componentNameMap['group'] = this.constructor;
    if (this.children) {
      this.buildAll(this.children);
    }
  }

  ngAfterViewInit() {}

  buildAll(arr) {
    this.host.viewContainerRef.clear();
    for (let child of arr) {
      this.build(child);
    }
  }

  build(obj) {
    let { name, type, attributes } = obj;
    let Component = componentNameMap[type];
    if (!Component) throw new Error(`unrecognized type (${ type })`);
    let factory = this.componentFactoryResolver.resolveComponentFactory(Component);
    let { viewContainerRef } = this.host;
    let componentRef = viewContainerRef.createComponent(factory);
    for (let attr of attributes) {
      // assert correct type for attribute
      (<GenericComponent>componentRef.instance)[attr.name] = attr.value;
    }
    return componentRef;
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.children) {
      this.buildAll(this.children);
    }
  }
}
