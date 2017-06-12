import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThermostatComponent } from './thermostat.component';
import { ThermostatRoutingModule } from './thermostat-routing.module';
import { CatalogModule } from '../catalog/catalog.module';

@NgModule({
  imports: [
    CommonModule,
    ThermostatRoutingModule,
    CatalogModule
  ],
  declarations: [
    ThermostatComponent
  ]
})
export class ThermostatModule { }
