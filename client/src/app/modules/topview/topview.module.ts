import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../guards/auth.guard';
import { TopviewComponent } from './components/topview.component';
import { TopviewNavComponent } from './components/topview-nav/topview-nav.component';
import { TopviewSubsectionComponent } from './components/topview-subsection/topview-subsection.component';


const routes: Routes = [
  {
    path: '',
    component: TopviewComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        canActivateChild: [ AuthGuard ],
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
    CommonModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    TopviewComponent,
    TopviewNavComponent,
    TopviewSubsectionComponent
  ]
})
export class TopviewModule { }
