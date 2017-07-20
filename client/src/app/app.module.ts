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
import { CatalogModule } from './modules/catalog/catalog.module';

// injectables
import { ConfigurationService } from './services/configuration.service';
import { AuthGuard } from './guards/auth.guard';
import { DefaultGuard } from './guards/default.guard';
import { LoginGuard } from './guards/login.guard';
import { LoadApplicationsGuard } from './guards/load-applications.guard';

// ngrx
import { effects } from './effects';
import { reducers } from './reducers';

// components
import { AppComponent } from './components/app.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { DummyComponent } from './components/dummy/dummy.component';
import { AuthorizationService } from './services/authorization.service';
import { SwitcherComponent } from './components/switcher/switcher.component';

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
    LoginContainerComponent
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
