import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './components/dashboard.component';
import { ApplicationTableComponent } from './components/application-table/application-table.component';
import { ObjectTableComponent } from './components/object-table/object-table.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';

import { AuthGuard } from '../../guards/auth.guard';

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
