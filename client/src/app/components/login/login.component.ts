import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AuthorizationService } from '../../services/authorization.service';
import { users, groups, applications } from '../../../../../defaultObjects.js';

import { Observable } from 'rxjs';

class User {
  username: string = '';
  password: string = '';
}

class Group {
  name: string = 'New Group';
}

class Application {
  name: string = 'New Application';
  description: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  credentials: FormGroup;
  redirectUrl: string;
  defaults = new FormControl();

  constructor(
    private authorization: AuthorizationService, 
    private fb: FormBuilder, 
    private router: Router, 
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.redirectUrl = this.route.snapshot.queryParams.redirectUrl;
    this.credentials = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.defaults.valueChanges.subscribe(value => {
      let acc = users.find(({ username }) => username == value);
      if (acc) {
        this.credentials.setValue({ username: acc.username, password: acc.password });
      }
    });

    this.authorization.loggedIn$.find(l => l).flatMap(() => this.redirectUrl ?
      Observable.of(this.redirectUrl) :
      this.authorization.applications$.first().map(apps => apps[0].path)
    ).do(x => console.log('redirecting to...', x)).subscribe(path => this.router.navigateByUrl(path));
  }

  login() {
    let { username, password } = this.credentials.value;
    this.authorization.login(username, password);
  }
}
