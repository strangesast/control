import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { GroupDirective } from './_directives';
import { NameFromAttrPipe, TitleCasePipe } from './_pipes';
import { RegistrationService } from './_services';
import { SwitcherService } from './_services';

import {
  JsonInputComponent,
  GroupComponent,
  FactoryComponent,
  ToggleButtonComponent,
  GenericComponent,
  TabGroupComponent,
  NumericInputComponent,
  GraphComponent,
  GaugeComponent,
  ListGroupComponent,
  ThermostatGaugeComponent,
  MapComponent,
  DrawerComponent,
  SwitcherComponent
} from './_components';

import entryComponents from './entry-components';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [
    ThermostatGaugeComponent,
    DrawerComponent,
    NameFromAttrPipe,
    TitleCasePipe,
    SwitcherComponent
  ],
  declarations: [
    JsonInputComponent,
    GroupComponent,
    FactoryComponent,
    ToggleButtonComponent,
    GroupDirective,
    GenericComponent,
    TabGroupComponent,
    TitleCasePipe,
    NameFromAttrPipe,
    NumericInputComponent,
    GraphComponent,
    GaugeComponent,
    ListGroupComponent,
    ThermostatGaugeComponent,
    DrawerComponent,
    MapComponent,
    SwitcherComponent
  ],
  providers: [
 //   SwitcherService
  ],
  entryComponents
})
export class CatalogModule { }
