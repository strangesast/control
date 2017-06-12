import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponent } from './dashboard.component';
import { ObjectTableComponent } from './object-table/object-table.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ApplicationTableComponent } from './application-table/application-table.component';
import { CatalogModule } from '../catalog/catalog.module';

import { DashboardRoutingModule } from './dashboard-routing.module';

@NgModule({
  imports: [
    CommonModule,
    DashboardRoutingModule,
    CatalogModule
  ],
  declarations: [
    DashboardComponent,
    ObjectTableComponent,
    UserProfileComponent,
    ApplicationTableComponent
  ]
})
export class DashboardModule { }
