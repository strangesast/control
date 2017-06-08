import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { ConfigurationService } from '../configuration.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../log-in/log-in.component.less']
})
export class RegisterComponent implements OnInit { credentials: FormGroup; constructor(private configuration: ConfigurationService, private fb: FormBuilder, private router: Router) { }
  errors;

  ngOnInit() {
    this.credentials = this.fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required],
      'password-confirm': [null, Validators.required]
    });
  }

  register() {
    if (this.credentials.valid) {
      let { username, password } = this.credentials.value;
      this.configuration.register({ username, password }).subscribe(() => {
        this.router.navigate([this.configuration.redirectUrl || 'dashboard']);
        this.credentials.reset();
      }, (err) => {
        this.errors = err;
      });
    }
  }

}
