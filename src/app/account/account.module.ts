import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { AccountRoutingModule } from './account-routing.module';

import { AccountComponent } from './account.component';
import { CreateComponent } from './create/create.component';
import { LoginComponent } from './login/login.component';


@NgModule({
  declarations: [AccountComponent, CreateComponent, LoginComponent],
  imports: [
    SharedModule,
    AccountRoutingModule
  ]
})
export class AccountModule { }
