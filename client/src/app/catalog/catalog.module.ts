import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { GroupDirective } from './_directives';
import { NameFromAttrPipe, TitleCasePipe } from './_pipes';
import { RegistrationService } from './_services';

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
  DrawerComponent
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
    TitleCasePipe
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
    MapComponent
  ],
  entryComponents
})
export class CatalogModule { }
