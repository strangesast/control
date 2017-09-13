import { Routes } from '@angular/router';

import { ConfigurationService } from './services/configuration.service';

import { LoginGuard } from './guards/login.guard';
import { LoadApplicationsGuard } from './guards/load-applications.guard';

// components
import { DummyComponent } from './components/dummy/dummy.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

const routes: Routes = [
  {
    path: '',
    resolve: { config: ConfigurationService },
    children: [
      { path: 'login',    component: LoginComponent,    canActivate: [ LoginGuard ] },
      { path: 'register', component: RegisterComponent, canActivate: [ LoginGuard ] },
      { path: '**',       component: DummyComponent,    canActivate: [ LoadApplicationsGuard ] }
    ]
  }
]
export { routes };
