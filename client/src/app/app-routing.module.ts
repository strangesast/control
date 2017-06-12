import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SelectivePreloadingStrategy } from './selective-preloading-strategy';
import { ConfigurationService } from './_services/configuration.service';
import { LogInComponent, RegisterComponent, NotFoundComponent } from './_components';
import { AuthGuard } from './_guards/auth.guard';

const routes: Routes = [
  {
    path: '', resolve: { configuration: ConfigurationService }, children:
    [
      { path: 'login', component: LogInComponent },
      { path: 'register', component: RegisterComponent },
      {
        path: 'dashboard',
        loadChildren: 'app/dashboard/dashboard.module#DashboardModule',
        canLoad: [AuthGuard]
      },
      {
        path: 'topview',
        loadChildren: 'app/topview/topview.module#TopviewModule',
        canLoad: [AuthGuard]
      },
      {
        path: 'energy',
        loadChildren: 'app/energy/energy.module#EnergyModule',
        canLoad: [AuthGuard]
      },
      {
        path: 'thermostat',
        loadChildren: 'app/thermostat/thermostat.module#ThermostatModule',
        canLoad: [AuthGuard]
      },
      // {
      //   path: '<path>',
      //   loadChildren: '<module_path>,
      //   data: { preload: true }
      // }
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: '**', component: NotFoundComponent }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: SelectivePreloadingStrategy })
  ],
  exports: [
    RouterModule
  ],
  providers: [
    ConfigurationService,
    SelectivePreloadingStrategy
  ]
})
export class AppRoutingModule {}
