import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AuthorizationService } from '../../services/authorization.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../log-in/log-in.component.less']
})
export class RegisterComponent implements OnInit {
  credentials: FormGroup;

  constructor(
    private authorization: AuthorizationService,
    private fb: FormBuilder,
    private router: Router) { }
  errors;

  ngOnInit() {
    this.credentials = this.fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required],
      'password-confirm': [null, Validators.required]
    });

    this.authorization.user$.subscribe(() => {
      this.credentials.reset();
      this.router.navigate([this.authorization.redirectUrl || 'dashboard']);
    });
  }

  register() {
    let { username, password } = this.credentials.value;
    this.authorization.register({ username, password });
  }

}
