import {
  Input,
  Output,
  Component,
  OnInit,
  ViewChild,
  EventEmitter,
  ViewContainerRef,
  ComponentFactory,
  ComponentFactoryResolver,
  SimpleChange
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReplaySubject, Observable, BehaviorSubject } from 'rxjs';

import { GroupComponent } from '../group/group.component';
import { GroupDirective } from '../../directives/group.directive';
import { RegistrationService } from '../../services';

import { componentNameMap } from '../../entry-components';

type ComponentDescription = { type: string, attributes: any[] }
type Template = any;

@Component({
  selector: 'app-factory',
  templateUrl: './factory.component.html',
  styleUrls: ['./factory.component.less']
})
export class FactoryComponent extends GroupComponent implements OnInit {
  @ViewChild(GroupDirective) host: GroupDirective;
  
  // template, input/output
  templateValue: Template;
  @Input()
  get template() {
    return this.templateValue;
  }
  @Output() templateChange = new EventEmitter();
  set template(template) {
    this.templateValue = template;
    this.templateChange.emit(this.templateValue);
    this.buildAll();
  }

  // valid, output only
  validValue: boolean;
  get valid() {
    return this.validValue;
  }
  @Output() validChange = new EventEmitter();
  set valid(valid) {
    this.validValue = valid;
    this.validChange.emit(this.validValue);
  }

  constructor(componentFactoryResolver: ComponentFactoryResolver, registration: RegistrationService) {
    super(componentFactoryResolver, registration);
  }

  ngOnInit() {
    this.registration.registeredTemplate.subscribe(template => {
      this.template = template;
    });
  }

  buildAll() {
    let { components } = this.template;
    let { root } = components;
    let expanded = expandTemplate(root, components);
    this.host.viewContainerRef.clear();
    this.build(expanded);
  }
}

function filterDuplicateObjects(stream) {
  return stream.startWith({}).map(v => JSON.stringify(v)).pairwise().filter(([a, b]) => {
    return b && a != b;
  }).map(([_, v]) => JSON.parse(v));
}

function expandTemplate(object, json, parents=['root']) {
  let { type, attributes } = object;
  let Component = componentNameMap[type];
  if (!Component) throw new Error(`invalid type "${ type }"`);
  attributes = attributes.map(attr => {
    let { name, value, type: attrType } = attr;
    // should verify correct type, value for name+component
    if (name == 'children') {
      value = value.map(childId => {
        let child = json[childId];
        if (parents.indexOf(childId) > -1) throw new Error(`parent-child loop ${ childId }`);
        if (!child) throw new Error(`invalid child reference "${ childId }"`);
        return expandTemplate(child, json, parents.concat(childId));
      });
    }
    return Object.assign({}, attr, { value });
  });
  return { Component, attributes };
}
