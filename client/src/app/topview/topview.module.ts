import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TopviewComponent } from './topview.component';
import { TopviewNavComponent } from './topview-nav/topview-nav.component';
import { TopviewSubsectionComponent } from './topview-subsection/topview-subsection.component';

import { TopviewRoutingModule } from './topview-routing.module';

@NgModule({
  imports: [
    CommonModule,
    TopviewRoutingModule
  ],
  declarations: [
    TopviewComponent,
    TopviewNavComponent,
    TopviewSubsectionComponent
  ]
})
export class TopviewModule { }
