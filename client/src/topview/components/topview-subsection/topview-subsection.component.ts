import { Component, OnInit } from '@angular/core';
import { navigationTransition } from '../../topview.animations';

@Component({
  selector: 'app-topview-subsection',
  templateUrl: './topview-subsection.component.html',
  animations: [navigationTransition()],
  styleUrls: ['./topview-subsection.component.less'],
  host: {
    '[@navigationTransition]': '"right"'
  }
})
export class TopviewSubsectionComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
