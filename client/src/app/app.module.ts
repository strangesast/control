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

import { StoreModule } from '@ngrx/store';
import { reducers, initialState } from './reducers';
import { AppEffectsModule } from './app-effects.module';
import { DummyComponent } from './components/dummy/dummy.component';
import { DefaultAppGuard } from './guards/default-app.guard';

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
    AppEffectsModule
  ],
  declarations: [
    AppComponent,
    LogInComponent,
    RegisterComponent,
    NotFoundComponent,
    DummyComponent
  ],
  providers: [ SwitcherService, ConfigurationService, AuthGuard, DefaultAppGuard ],
  bootstrap: [ AppComponent ],
})
export class AppModule { }
