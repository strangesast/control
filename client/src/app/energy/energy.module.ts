import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnergyComponent } from './energy.component';

import { EnergyRoutingModule } from './energy-routing.module';

@NgModule({
  imports: [
    CommonModule,
    EnergyRoutingModule
  ],
  declarations: [
    EnergyComponent
  ],
  bootstrap: [ EnergyComponent ]
})
export class EnergyModule { }
