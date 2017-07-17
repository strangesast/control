import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigurationService } from '../../../../services/configuration.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-application-table',
  template: `
  <div class="box box-shadow">
    <div *ngFor="let application of applications$ | async">
      <img src="/assets/placeholder.png"/>
      <div>
        <a routerLink="/{{ application.path }}" class="name">{{ application.name }}</a>
      </div>
    </div>
  </div>
  `,
  //templateUrl: './application-table.component.html',
  styleUrls: ['./application-table.component.less']
})
export class ApplicationTableComponent {
  applications$: Observable<any[]>;

  constructor(private route: ActivatedRoute, private configuration: ConfigurationService) {
    this.applications$ = this.configuration.applications$;
  }
}
