import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EnergyComponent } from './energy.component';

const routes: Routes = [
  {
    path: '',
    component: EnergyComponent
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
export class EnergyRoutingModule {}
