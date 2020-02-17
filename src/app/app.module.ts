import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { environment } from '../environments/environment';




import {ToastModule,
  WavesModule,
  InputsModule,
  ModalModule,
  TabsModule,
  ButtonsModule,
  TooltipModule,
  CollapseModule,
  DropdownModule,
  CardsModule,
  CharCounterModule,
  PopoverModule,
  CarouselModule} from 'ng-uikit-pro-standard';


import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';


import { AppComponent } from './app.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    NavBarComponent,
  ],
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    ToastModule.forRoot(),
    WavesModule.forRoot(),
    InputsModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    ButtonsModule.forRoot(),
    TooltipModule.forRoot(),
    CollapseModule.forRoot(),
    DropdownModule.forRoot(),
    CardsModule.forRoot(),
    CharCounterModule.forRoot(),
    PopoverModule.forRoot(),
    CarouselModule.forRoot(),
    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    AngularFireStorageModule, // imports firebase/storage only needed for storage features
    AppRoutingModule //It must go at the bottom
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
