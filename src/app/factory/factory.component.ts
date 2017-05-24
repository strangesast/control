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

const componentNameMap = {
  'group': GroupComponent,
  'toggleButton': ToggleButtonComponent
}

const validAttributes = {
  'group': ['backgroundColor', 'color'],
  'toggleButton': ['backgroundColor', 'color', 'label', 'value']
}

@Component({
  selector: 'app-factory',
  templateUrl: './factory.component.html',
  styleUrls: ['./factory.component.css']
})
export class FactoryComponent implements OnInit {
  @Input() json;
  private stream = new BehaviorSubject<any>(this.json);
  private groupComponentFactory: ComponentFactory<GroupComponent>;
  private factories: {[propKey: string]: ComponentFactory<any>} = {};
  @ViewChild('container', { read: ViewContainerRef }) public container;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.factories['group'] = this.componentFactoryResolver.resolveComponentFactory(GroupComponent);
    this.factories['toggleButton'] = this.componentFactoryResolver.resolveComponentFactory(ToggleButtonComponent);
    this.stream.filter(value => value && value.root)
      .subscribe(json => {
        this.container.clear();
        this.build(json.root, json);
      }, (err) => console.error(err))
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.json) {
      this.stream.next(changes.json.currentValue)
    }
  }

  build(props, json, parentViewContainer=this.container, parentIds=[]) {
    let elementRef = this.buildElement(props, parentViewContainer);
    let { name, type, attributes } = props;
    if (!(type in this.factories)) throw new Error('invalid element type');
    if (parentIds.indexOf(name) > -1) throw new Error(`parent-child loop "${ name }"`);

    let children = props['attributes'].find(({name})=> name==='children');
    if (children) {
      for (let childId of children.value) {
        let child = json[childId];
        if (!child) throw new Error('invalid child reference');
        let childElement = this.buildElement(child, elementRef.instance.container);
        this.build(child, json, childElement.instance.container, parentIds.concat(name))
      }
    }
  }

  buildElement(props, viewContainer) {
    let factories = this.factories;
    let { name, type, attributes } = props;
    if (!(type in factories)) throw new Error(`invalid group ("${ type }")`);
    let factory = factories[type];
    let componentRef = viewContainer.createComponent(factory);
    for (let attribute of attributes) {
      let { name } = attribute;
      if (name == 'children') {
      } else if (validAttributes[type].indexOf(name) > -1) {
        componentRef.instance[name] = attribute.value;
      } else {
        throw new Error(`invalid attribute for this element ("${ name }")`)
      }
    }
    return componentRef;
  }
}
