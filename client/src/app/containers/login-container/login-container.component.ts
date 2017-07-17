import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from '../../services/authorization.service';
import { Observable } from 'rxjs';

import { User } from '../../models';

@Component({
  selector: 'app-login-container',
  templateUrl: './login-container.component.html',
  styleUrls: ['./login-container.component.less']
})
export class LoginContainerComponent { 
  user$: Observable<User>;
  errors: Observable<any[]>;

  constructor(private authorization: AuthorizationService) {}
}
