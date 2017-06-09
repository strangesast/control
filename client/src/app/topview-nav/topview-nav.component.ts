import { Component, OnInit } from '@angular/core';
import { navigationTransition } from '../topview.animations';

@Component({
  selector: 'app-topview-nav',
  templateUrl: './topview-nav.component.html',
  animations: [navigationTransition()],
  styleUrls: ['./topview-nav.component.less'],
  host: {
    '[@navigationTransition]': '"left"'
  }
})
export class TopviewNavComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
