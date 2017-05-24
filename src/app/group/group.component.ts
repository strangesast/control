import { ViewChild, Input, Component, OnInit, AfterViewInit, ViewContainerRef } from '@angular/core';
import { GroupDirective } from '../group.directive';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css'],
  host: {
    '[style.background-color]': 'backgroundColor',
    '[style.color]': 'color'
  }
})
export class GroupComponent implements OnInit, AfterViewInit {
  @ViewChild('container', { read: ViewContainerRef }) public container;
  @Input() layout: string;
  @Input() backgroundColor: string;
  @Input() color: string = '#000';

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {}

}
