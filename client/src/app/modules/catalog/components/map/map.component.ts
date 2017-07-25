import { ViewChild, Component, OnInit, ElementRef } from '@angular/core';
import { GenericComponent } from '../generic/generic.component';
import * as d3 from 'd3';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less']
})
export class MapComponent extends GenericComponent implements OnInit {
  ngOnInit() {
  }

}
