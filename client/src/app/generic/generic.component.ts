import { Input, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-generic',
  templateUrl: './generic.component.html',
  styleUrls: ['./generic.component.css'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color'
  }
})
export class GenericComponent implements OnInit {
  @Input() backgroundColor: string;
  @Input() color: string = '#000';

  constructor() { }

  ngOnInit() {
  }

}
