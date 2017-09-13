import { Component, OnInit } from '@angular/core';
import { Headers, RequestOptions } from '@angular/http';
import { ActivatedRoute } from '@angular/router';
import { AuthorizationService } from '../../../app/services/authorization.service';
import { Observable } from 'rxjs';

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
  //templateUrl: './object-table.component.html',
  template: `
<span class="title">{{ objectType$ | async | titleCase }}</span>
<div class="options">
  <label>Sort By</label>
  <select>
    <option>Name</option>
  </select>
</div>
<div class="box-shadow table">
  <div *ngFor="let object of objects$ | async" class="row">
    <img class="profile" src="/assets/placeholder.png">
    <div>
      <span class="name">{{ object.name }}</span>
      <span class="username">Username</span>
      <span class="groups">Groups</span>
    </div>
  </div>
</div>
  `,
  styleUrls: ['./object-table.component.less']
})
export class ObjectTableComponent {
  objectType$: Observable<string>;
  objects$: Observable<any[]>;

  constructor(route: ActivatedRoute, private auth: AuthorizationService) {
    this.objectType$ = route.params.map(param => param['type'] as string).shareReplay();
    this.objects$ = this.objectType$.switchMap(type => this.auth.get(`/api/${ type }`));
  }
}
