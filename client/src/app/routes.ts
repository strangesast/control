import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { ConfigurationService } from './services/configuration.service';
import { DummyComponent } from './components/dummy/dummy.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { RegisterComponent } from './components/register/register.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

const routes: Routes = [
  { path: 'login',    component: LogInComponent,    canActivate: [ LoginGuard ] },
  { path: 'register', component: RegisterComponent, canActivate: [ LoginGuard ] },
  {
    path: '',
    canActivate: [ AuthGuard ],
    resolve: { config: ConfigurationService },
    //canActivateChild: [ AuthGuard ],
    children: [
      { path: '', redirectTo: 'toast', pathMatch: 'full' }
    ]
  },
  { path: '**', component: NotFoundComponent }
]
export default routes;
