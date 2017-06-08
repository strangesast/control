import { Component, OnInit } from '@angular/core';
import { routerTransition } from '../router.animations';

@Component({
  selector: 'app-topview',
  templateUrl: './topview.component.html',
  styleUrls: ['./topview.component.less'],
  animations: [routerTransition()],
  host: {
    '[@routerTransition]': ''
  }
})
export class TopviewComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
