import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { ListGroupComponent } from './list-group/list-group.component';

import entryComponents from './entry-components';
import { ThermostatComponent } from './thermostat/thermostat.component';

const routes: Routes = [
  { path: '', resolve: { registration: RegistrationService }, children:
    [
      { path: '', component: FactoryComponent },
      { path: 'configure', component: JsonInputComponent }
    ]
  }
];

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
    GaugeComponent,
    ListGroupComponent,
    ThermostatComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes)
  ],
  providers: [ RegistrationService ],
  bootstrap: [AppComponent],
  entryComponents
})
export class AppModule { }
