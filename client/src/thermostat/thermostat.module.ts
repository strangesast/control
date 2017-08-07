import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThermostatComponent } from './components/thermostat.component';
import { ThermostatRoutingModule } from './thermostat-routing.module';
import { SwitcherService } from '../catalog/services/switcher.service';
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
