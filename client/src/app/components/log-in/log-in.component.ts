import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AuthorizationService } from '../../services';
import { users, groups, applications } from '../../../../../defaultObjects.js';

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
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.less']
})
export class LogInComponent implements OnInit {
  credentials: FormGroup;
  redirectUrl: string;
  defaults = new FormControl();
  errors;

  constructor(private authorization: AuthorizationService, private fb: FormBuilder, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.redirectUrl = this.route.snapshot.queryParams.returlUrl;
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

    this.authorization.loggedIn$.filter(b => b).first().subscribe(() => {
      this.router.navigate([this.redirectUrl || 'dashboard']);
    });
  }

  login() {
    if (this.credentials.valid) {
      let { username, password } = this.credentials.value;
      this.authorization.login(username, password);
    }
  }
}
