import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './effects';

@NgModule({
  imports: [
    HttpModule,
    EffectsModule.forRoot([
      AuthEffects
    ])
  ]
})
export class AppEffectsModule {}
