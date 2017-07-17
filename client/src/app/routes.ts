import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { ConfigurationService } from './services/configuration.service';
import { DummyComponent } from './components/dummy/dummy.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { RegisterComponent } from './components/register/register.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { DefaultGuard } from './guards/default.guard';

const routes: Routes = [
  { path: 'login',    component: LogInComponent,    canActivate: [ LoginGuard ] },
  { path: 'register', component: RegisterComponent, canActivate: [ LoginGuard ] },
  {
    path: '',
    canActivate: [ AuthGuard ],
    resolve: { config: ConfigurationService },
    children: [
      {
        path: 'dashboard',
        loadChildren: 'app/modules/dashboard/dashboard.module#DashboardModule',
        canLoad: [AuthGuard]
      },
      {
        path: 'topview',
        loadChildren: 'app/modules/topview/topview.module#TopviewModule',
        canLoad: [AuthGuard]
      },
      {
        path: 'energy-profile',
        loadChildren: 'app/modules/energy/energy.module#EnergyModule',
        canLoad: [AuthGuard]
      },
      {
        path: 'thermostat',
        loadChildren: 'app/modules/thermostat/thermostat.module#ThermostatModule',
        canLoad: [AuthGuard]
      },
      { path: '', component: DummyComponent, canActivate: [ DefaultGuard ] },
      { path: '**', component: NotFoundComponent }
    ]
  }
]
export { routes };
