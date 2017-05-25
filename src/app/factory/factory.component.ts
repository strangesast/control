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

function unwrap(current, json, parents=[]) {
  if (current.children) {
    parents.push(current.name);
    current.children = current.children.map(id => {
      let child = json[id];
      if (!child) throw new Error(`invalid child reference "${ id }"`);
      return unwrap(child, json);
    });
  }
  return current
}

@Component({
  selector: 'app-factory',
  templateUrl: './factory.component.html',
  styleUrls: ['./factory.component.css']
})
export class FactoryComponent implements OnInit {
  @Input() json;
  private stream = new BehaviorSubject<any>(this.json);

  constructor() { }

  ngOnInit() {
    this.stream.filter(value => value && value.root)
      .subscribe(json => {
        let root = json.root;
        let { name, type, attributes } = root;
        console.log(name, type, attributes)
      }, (err) => console.error(err))
  }

  ngOnChanges(changes: {[propKey: string]: SimpleChange}) {
    if (changes.json) {
      this.stream.next(changes.json.currentValue)
    }
  }
}
