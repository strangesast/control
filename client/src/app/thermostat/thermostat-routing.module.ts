import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThermostatComponent } from './thermostat.component';

const routes: Routes = [
  {
    path: '',
    component: ThermostatComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class ThermostatRoutingModule {}
