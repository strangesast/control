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
import { LoginGuard } from './guards/login.guard';

// ngrx
import { AuthEffects } from './effects';
import { reducers, initialState } from './reducers';

// components
import { AppComponent } from './components/app.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { RegisterComponent } from './components/register/register.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { DummyComponent } from './components/dummy/dummy.component';
import { AuthorizationService } from './services/authorization.service';
import { SwitcherComponent } from './components/switcher/switcher.component';

import routes from './routes'

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(routes),
    CatalogModule,
    EffectsModule.forRoot([
      AuthEffects
    ]),
    StoreModule.forRoot(reducers)
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
    ConfigurationService, 
    AuthorizationService,
    AuthGuard,
    LoginGuard
  ],
  bootstrap: [ AppComponent ],
})
export class AppModule { }
