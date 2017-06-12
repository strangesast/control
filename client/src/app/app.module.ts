import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { CatalogModule } from './catalog/catalog.module';

import { AppComponent } from './app.component';

import { LogInComponent, RegisterComponent } from './_components';
import { SwitcherService } from './_services/switcher.service';
import { ConfigurationService } from './_services/configuration.service';

import { AuthGuard } from './_guards/auth.guard';

import { AppRoutingModule } from './app-routing.module';
import { NotFoundComponent } from './_components/not-found/not-found.component'

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule,
    CatalogModule
  ],
  declarations: [
    AppComponent,
    LogInComponent,
    RegisterComponent,
    NotFoundComponent
  ],
  providers: [ SwitcherService, ConfigurationService, AuthGuard ],
  bootstrap: [ AppComponent ],
})
export class AppModule { }
