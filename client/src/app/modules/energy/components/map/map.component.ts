import { Input, Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent implements OnInit {
  @Input() layers: string[];

  constructor() { }

  ngOnInit() {
  }

}
