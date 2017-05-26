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
import { ReplaySubject, Observable, BehaviorSubject } from 'rxjs';

import { GroupComponent } from '../group/group.component';
import { GroupDirective } from '../group.directive';
import { RegistrationService } from '../registration.service';

import { componentNameMap } from '../entry-components';

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

type ComponentDescription = { type: string, attributes: any[] }

@Component({
  selector: 'app-factory',
  templateUrl: './factory.component.html',
  styleUrls: ['./factory.component.css']
})
export class FactoryComponent extends GroupComponent implements OnInit {
  stream;
  jsonValue: any;
  @Output() jsonChange = new EventEmitter();
  @Input() get json() {
    return this.jsonValue;
  }
  set json(val) {
    this.jsonChange.emit(this.jsonValue = val);
  }
  @ViewChild(GroupDirective) host: GroupDirective;
  registered: boolean = false;
  valid: boolean = false;
  pending = new ReplaySubject(1);

  constructor(componentFactoryResolver: ComponentFactoryResolver, registration: RegistrationService) {
    super(componentFactoryResolver, registration);
  }

  ngOnInit() {
    filterDuplicateObjects(this.registration.init().flatMap(() => {
      return Observable.merge(this.registration.registeredTemplate, this.pending);
    })).map(template => {
      this.json = template;
      try {
        this.buildAll();
        this.valid = true;
      } catch (e) {
        console.error(e);
        this.valid = false;
      }
    }).subscribe();
  }

  buildAll() {
    let expanded = expandTemplate(this.json.components.root, this.json.components);
    this.registration.template = this.json;
    this.host.viewContainerRef.clear();
    this.build(expanded);
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes['json']) {
      this.pending.next(this.json);
    }
  }
}
