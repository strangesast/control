import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { StoreModule, combineReducers, compose } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

// modules
import { CatalogModule } from '../catalog/catalog.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { TopviewModule } from '../topview/topview.module';
import { TopviewAlternateModule } from '../topview-alternate/topview-alternate.module';
import { EnergyModule } from '../energy/energy.module';
import { ThermostatModule } from '../thermostat/thermostat.module';
const modules = [
  //DashboardModule,
  TopviewModule,
  TopviewAlternateModule,
  EnergyModule,
  ThermostatModule
];

// injectables
import { ConfigurationService } from './services/configuration.service';
import { AuthGuard } from './guards/auth.guard';
import { DefaultGuard } from './guards/default.guard';
import { LoginGuard } from './guards/login.guard';
import { LoadApplicationsGuard } from './guards/load-applications.guard';

// ngrx
import { effects } from './effects';
import { reducers } from './reducers';

// directives
import { AppComponent } from './components/app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { DummyComponent } from './components/dummy/dummy.component';
import { AuthorizationService } from './services/authorization.service';
import { SwitcherComponent } from './components/switcher/switcher.component';
import { TreeDirective } from './directives/tree.directive';

// containers
import { LoginContainerComponent } from './containers/login-container/login-container.component'

import { routes } from './routes';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    CatalogModule,
    RouterModule.forRoot(routes),
    EffectsModule.forRoot(effects),
    StoreModule.forRoot(reducers)
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    NotFoundComponent,
    DummyComponent,
    SwitcherComponent,
    LoginContainerComponent,
    TreeDirective
  ],
  providers: [
    ConfigurationService, 
    AuthorizationService,
    AuthGuard,
    DefaultGuard,
    LoginGuard,
    LoadApplicationsGuard
  ],
  entryComponents: [ NotFoundComponent ],
  bootstrap: [ AppComponent ],
})
export class AppModule { }
