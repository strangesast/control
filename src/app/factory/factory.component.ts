import {
  Input,
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ComponentFactory,
  ComponentFactoryResolver,
  SimpleChange
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { GroupComponent } from '../group/group.component';
import { ToggleButtonComponent } from '../toggle-button/toggle-button.component';
import { GroupDirective } from '../group.directive';
import { GenericComponent } from '../generic/generic.component';
import { TabGroupComponent } from '../tab-group/tab-group.component';

const componentNameMap = {
  'group': GroupComponent,
  'tabGroup': TabGroupComponent,
  'toggleButton': ToggleButtonComponent
}

function expandChildren (obj, json, parents=['root']) {
  let { type, attributes } = obj;
  obj.type = componentNameMap[type];
  for (let attr of attributes) {
    if (attr.name == 'children') {
      attr.value = attr.value.map(childId => {
        if (parents.indexOf(childId) > -1) throw new Error(`parent-child loop ${ childId }`);
        let child = json[childId];
        if (!child) throw new Error(`invalid child reference (${ childId })`);
        expandChildren(child, json, parents.concat(childId));
        return child;
      });
    }
  }
}

@Component({
  selector: 'app-factory',
  templateUrl: './factory.component.html',
  styleUrls: ['./factory.component.css']
})
export class FactoryComponent implements OnInit {
  @Input() json;
  @ViewChild(GroupDirective) host: GroupDirective;
  private stream = new BehaviorSubject<any>(this.json);

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.stream.filter(value => value && value.root)
      .subscribe(json => {
        let root = json.root;
        expandChildren(root, json)
        this.build(root);

      }, (err) => console.error(err))
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.json) {
      this.stream.next(changes.json.currentValue)
    }
  }

  build(obj) {
    let { type: Component, attributes } = obj;
    let factory = this.componentFactoryResolver.resolveComponentFactory(Component);
    let { viewContainerRef } = this.host;
    viewContainerRef.clear();
    let componentRef = viewContainerRef.createComponent(factory);
    for (let attr of attributes) {
      // assert correct type for attribute
      (<GenericComponent>componentRef.instance)[attr.name] = attr.value;
    }
    return componentRef;
  }
}
