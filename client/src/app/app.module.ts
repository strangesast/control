import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { CatalogModule } from './modules/catalog/catalog.module';

import { AppComponent } from './components/app.component';

import { LogInComponent, RegisterComponent } from './components';
import { ConfigurationService } from './services/configuration.service';

import { AuthGuard } from './guards/auth.guard';

import { AppRoutingModule } from './app-routing.module';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { SwitcherService } from './modules/catalog/services/switcher.service';

import { StoreModule, combineReducers, compose } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from './effects';

import { reducers, initialState, debug } from './reducers';
import { DummyComponent } from './components/dummy/dummy.component';
import { AuthorizationService } from './services/authorization.service';
import { SwitcherComponent } from './components/switcher/switcher.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule,
    CatalogModule,
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([
      AuthEffects
    ])
  ],
  declarations: [
    AppComponent,
    LogInComponent,
    RegisterComponent,
    NotFoundComponent,
    DummyComponent,
    SwitcherComponent
  ],
  providers: [
    SwitcherService,
    ConfigurationService, 
    AuthGuard, 
    AuthorizationService
  ],
  bootstrap: [ AppComponent ],
})
export class AppModule { }
