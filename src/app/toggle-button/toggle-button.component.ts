import { Input, Component, OnInit } from '@angular/core';
import { GenericComponent } from '../generic/generic.component';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.css']
})
export class ToggleButtonComponent extends GenericComponent implements OnInit {
  @Input() label: string;
  @Input() value: any;

  constructor() {
    super();
  }

  ngOnInit() {
  }

}
