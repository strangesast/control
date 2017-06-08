import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
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
import { ThermostatComponent } from './thermostat/thermostat.component';
import { ExampleComponent } from './example/example.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MapComponent } from './map/map.component';

import entryComponents from './entry-components';
import { TitleCasePipe } from './title-case.pipe';
import { ObjectTableComponent } from './object-table/object-table.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ApplicationTableComponent } from './application-table/application-table.component';
import { ConfigurationService } from './configuration.service';
import { LogInComponent } from './log-in/log-in.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './auth.guard';

const routes: Routes = [
  { path: '', resolve: { configuration: ConfigurationService }, children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'login', component: LogInComponent },
      { path: 'register', component: RegisterComponent },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        children: [
          { path: '', redirectTo: 'applications', pathMatch: 'full'},
          { path: 'applications', component: ApplicationTableComponent },
          { path: 'profile', component: UserProfileComponent },
          { path: 'objects', component: ObjectTableComponent },
          { path: 'objects/:type', component: ObjectTableComponent }
        ]
      }
    ]
  },
  { path: 'examples', component: ExampleComponent },
  { path: 'examples/:example', component: ExampleComponent },
  { path: 'factory', resolve: { registration: RegistrationService }, children:
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
    ThermostatComponent,
    ExampleComponent,
    MapComponent,
    DashboardComponent,
    TitleCasePipe,
    ObjectTableComponent,
    UserProfileComponent,
    ApplicationTableComponent,
    LogInComponent,
    RegisterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(routes)
  ],
  providers: [ RegistrationService, ConfigurationService, AuthGuard ],
  bootstrap: [AppComponent],
  entryComponents
})
export class AppModule { }
