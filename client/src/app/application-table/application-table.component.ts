import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigurationService } from '../configuration.service';

@Component({
  selector: 'app-application-table',
  templateUrl: './application-table.component.html',
  styleUrls: ['./application-table.component.less']
})
export class ApplicationTableComponent implements OnInit {
  applications: any[];

  constructor(private route: ActivatedRoute, private configuration: ConfigurationService) { }

  ngOnInit() {
    this.applications = this.configuration.applications
  }

}
