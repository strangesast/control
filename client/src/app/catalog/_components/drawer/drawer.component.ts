import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.less'],
  host: {
    '[class.side]': 'side'
  }
})
export class DrawerComponent {
  side: boolean = false;
}
