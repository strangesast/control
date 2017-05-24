import { Input, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-toggle-button',
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.css']
})
export class ToggleButtonComponent implements OnInit {
  @Input() backgroundColor: string;
  @Input() color: string = '#000';
  @Input() label: string;
  @Input() value: any;


  constructor() { }

  ngOnInit() {
  }

}
