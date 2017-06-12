import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { ApplicationTableComponent } from './application-table/application-table.component';
import { ObjectTableComponent } from './object-table/object-table.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

import { AuthGuard } from '../_guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        canActivateChild: [AuthGuard],
        children: [
          { path: '', component: ApplicationTableComponent },
          { path: 'profile', component: UserProfileComponent },
          { path: 'objects', component: ObjectTableComponent },
          { path: 'objects/:type', component: ObjectTableComponent }
        ]
      }
    ]
  }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class DashboardRoutingModule {}
