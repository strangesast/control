import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardComponent } from './dashboard.component';
import { ObjectTableComponent } from './object-table/object-table.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ApplicationTableComponent } from './application-table/application-table.component';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { CatalogModule } from '../catalog/catalog.module';

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
