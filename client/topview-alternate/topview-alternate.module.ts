import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TopviewAlternateComponent } from './components/topview-alternate.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([])
  ],
  declarations: [
    TopviewAlternateComponent
  ]
})
export class TopviewAlternateModule { }
