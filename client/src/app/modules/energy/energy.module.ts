import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { EnergyComponent } from './components/energy.component';

import { EnergyRoutingModule } from './energy-routing.module';
import { MapComponent } from './components/map/map.component';
import { DataService } from './services/data.service';
import { GraphComponent } from './components/graph/graph.component';
import { TreeListComponent } from './components/tree-list/tree-list.component';

import { effects } from './effects';
import { reducers } from './reducers';

const routes: Routes = [
  {
    path: '',
    component: EnergyComponent
  }
];


@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    RouterModule.forChild(routes),
    EffectsModule.forFeature(effects),
    StoreModule.forFeature('energy', reducers)
  ],
  declarations: [
    EnergyComponent,
    MapComponent,
    GraphComponent,
    TreeListComponent
  ],
  bootstrap: [ EnergyComponent ],
  providers: [DataService]
})
export class EnergyModule { }
