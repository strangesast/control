import {
  ElementRef,
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

const componentNameMap = {
  'group': GroupComponent,
  'toggleButton': ToggleButtonComponent
}

const validAttributes = {
  'group': ['backgroundColor', 'color'],
  'toggleButton': ['backgroundColor', 'color', 'label', 'value']
}

function expandChildren (obj, json, parents=[]) {
  let { name, type, attributes } = obj;
  for (let attr of attributes) {
    if (attr.name == 'children') {
      attr.value = attr.value.map(childId => {
        let child = json[childId];
        if (!child) throw new Error(`invalid child reference (${ childId })`);
        expandChildren(child, json, parents.concat(name));
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
        console.log('root', root);

      }, (err) => console.error(err))
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.json) {
      this.stream.next(changes.json.currentValue)
    }
  }

  build(obj) {
    let { name, type, attributes } = obj;
    let Component = componentNameMap[type];
    if (!Component) throw new Error(`unrecognized type (${ type })`);
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
