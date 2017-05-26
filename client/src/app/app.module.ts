import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { JsonInputComponent } from './json-input/json-input.component';
import { GroupComponent } from './group/group.component';
import { FactoryComponent } from './factory/factory.component';
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';
import { GroupDirective } from './group.directive';
import { GenericComponent } from './generic/generic.component';
import { TabGroupComponent } from './tab-group/tab-group.component';
import { NameFromAttrPipe } from './name-from-attr.pipe';

import { RegistrationService } from './registration.service';
import { NumericInputComponent } from './numeric-input/numeric-input.component';
import { GraphComponent } from './graph/graph.component';
import { GaugeComponent } from './gauge/gauge.component';

import entryComponents from './entry-components';

const routes: Routes = [];

@NgModule({
  declarations: [
    AppComponent,
    JsonInputComponent,
    GroupComponent,
    FactoryComponent,
    ToggleButtonComponent,
    GroupDirective,
    GenericComponent,
    TabGroupComponent,
    NameFromAttrPipe,
    NumericInputComponent,
    GraphComponent,
    GaugeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes)
  ],
  providers: [RegistrationService],
  bootstrap: [AppComponent],
  entryComponents
})
export class AppModule { }
