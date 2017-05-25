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
import diff from 'deep-diff';
import { BehaviorSubject } from 'rxjs';

import { GroupComponent } from '../group/group.component';
import { ToggleButtonComponent } from '../toggle-button/toggle-button.component';
import { GroupDirective } from '../group.directive';
import { GenericComponent } from '../generic/generic.component';
import { TabGroupComponent } from '../tab-group/tab-group.component';

import { RegistrationService } from '../registration.service';

const componentNameMap = {
  'group': GroupComponent,
  'tabGroup': TabGroupComponent,
  'toggleButton': ToggleButtonComponent
}

function filterDuplicateObjects(stream) {
  return stream.startWith({}).map(v => JSON.stringify(v)).pairwise().filter(([a, b]) => {
    return b && a != b;
  }).map(([_, v]) => JSON.parse(v));
}

function expandChildren (obj, json, parents=['root']) {
  let { type, attributes } = obj;
  obj.Component = componentNameMap[type];
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
  root;
  registered: boolean = false;
  valid: boolean = false;

  constructor(componentFactoryResolver: ComponentFactoryResolver, private registration: RegistrationService) {
    super(componentFactoryResolver);
  }

  ngOnInit() {
    this.registration.init().subscribe(template => {
      this.registered = true;
      this.json = template || this.json;

      this.stream = this.jsonChange.asObservable().startWith(this.json);

      filterDuplicateObjects(this.stream).subscribe(config => {
        console.log('registering...')
        this.registration.register(config);
      });

      filterDuplicateObjects(this.stream.pluck('components')).subscribe((components: {[propKey: string]: ComponentDescription}) => {
        let root = components.root;
        try {
          expandChildren(root, components);
          this.root = root;
          this.buildAll();
          this.valid = true;
        } catch (e) {
          this.valid = false;
        }
      });
    });
  }

  buildAll() {
    this.host.viewContainerRef.clear();
    this.build(this.root)
  }
}
