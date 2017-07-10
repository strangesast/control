import { Component, OnInit } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { ActivatedRoute } from '@angular/router';
import { ConfigurationService } from '../../../../services/configuration.service';

class User {
  name: string;
  username: string;
  password: string;
  groups: string[];
  applications: { id: string, write: boolean }[];
  static attributes = ['name', 'username', 'groups', 'applications'];
}

class Group {
  static attributes = ['name', 'id', 'description', 'applications'];
}

class Application {
  name: string;
  id: string;
  path: string;
  static attributes = ['name']
}

class Point {}

const classMap = {'users': User, 'groups': Group, 'applications': Application, 'points': Point };

@Component({
  selector: 'app-object-table',
  templateUrl: './object-table.component.html',
  styleUrls: ['./object-table.component.less']
})
export class ObjectTableComponent implements OnInit {
  objectType;
  objects: any[];

  constructor(private route: ActivatedRoute, private http: Http, private configuration: ConfigurationService) { }

  ngOnInit() {
    let objectType = this.route.params.pluck('type').shareReplay();
    objectType.subscribe(ot => this.objectType = ot);

    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({ headers });
    objectType.withLatestFrom(this.configuration.user.pluck('token')).switchMap(([type, token]) => {
      options.headers.set('Authorization', 'JWT ' + token);  
      return this.http.get(`/api/${ type }/`, options).map(res => res.json());
    }).subscribe(objects => this.objects = objects);

  }
}
