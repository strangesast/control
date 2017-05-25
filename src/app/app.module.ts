import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { JsonInputComponent } from './json-input/json-input.component';
import { GroupComponent } from './group/group.component';
import { FactoryComponent } from './factory/factory.component';
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';
import { GroupDirective } from './group.directive';
import { GenericComponent } from './generic/generic.component';

@NgModule({
  declarations: [
    AppComponent,
    JsonInputComponent,
    GroupComponent,
    FactoryComponent,
    ToggleButtonComponent,
    GroupDirective,
    GenericComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [GroupComponent, ToggleButtonComponent]
})
export class AppModule { }
