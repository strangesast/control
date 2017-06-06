import { Input, Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { GenericComponent } from '../generic/generic.component';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.css'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color'
  }
})
export class ToggleButtonComponent extends GenericComponent {
  @Input() label: string;
  @Input() value: any;
}
