import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { MaterialModule } from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import 'hammerjs';

import { FileUploadModule } from 'ng2-file-upload';
import { FormWizardModule } from 'angular2-wizard';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    FileUploadModule,
    BrowserAnimationsModule,
    FormWizardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
