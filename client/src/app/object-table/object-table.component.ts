import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-object-table',
  templateUrl: './object-table.component.html',
  styleUrls: ['./object-table.component.less']
})
export class ObjectTableComponent implements OnInit {
  objectType;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.pluck('type').subscribe(objectType => {
      this.objectType = objectType;
    });
  }
}
