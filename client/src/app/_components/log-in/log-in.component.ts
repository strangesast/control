import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ConfigurationService } from '../../_services';
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

  constructor(private configuration: ConfigurationService, private fb: FormBuilder, private router: Router, private route: ActivatedRoute) { }

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
  }

  login() {
    if (this.credentials.valid) {
      let { username, password } = this.credentials.value;
      this.configuration.login(username, password).subscribe(() => {
        this.router.navigate([this.redirectUrl || 'dashboard']);
        this.credentials.reset();
      }, (err) => {
        this.errors = err;
      });
    }
  }
}
