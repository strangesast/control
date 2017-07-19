import { Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { LoadApplicationsGuard } from './guards/load-applications.guard';
import { ConfigurationService } from './services/configuration.service';

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
  },
  // need to include these for precompilation...
  {
    path: '1',
    loadChildren: 'app/modules/dashboard/dashboard.module#DashboardModule',
  },
  {
    path: '2',
    loadChildren: 'app/modules/topview/topview.module#TopviewModule',
  },
  {
    path: '3',
    loadChildren: 'app/modules/topview-alternate/topview-alternate.module#TopviewAlternateModule',
  },
  {
    path: '4',
    loadChildren: 'app/modules/energy/energy.module#EnergyModule',
  },
  {
    path: '5',
    loadChildren: 'app/modules/thermostat/thermostat.module#ThermostatModule',
  }
]
export { routes };
