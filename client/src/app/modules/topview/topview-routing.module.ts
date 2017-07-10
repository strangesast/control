import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TopviewComponent } from './components/topview.component';
import { TopviewNavComponent } from './components/topview-nav/topview-nav.component';
import { TopviewSubsectionComponent } from './components/topview-subsection/topview-subsection.component';

import { AuthGuard } from '../../guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TopviewComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        canActivateChild: [AuthGuard],
        children: [
          { path: '', component: TopviewNavComponent },
          { path: ':subsection', component: TopviewSubsectionComponent }
        ]
      }
    ]
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
export class TopviewRoutingModule {}
