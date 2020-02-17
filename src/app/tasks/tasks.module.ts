import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';

import { TasksRoutingModule } from './tasks-routing.module';
import { TasksComponent } from './tasks.component';


@NgModule({
  declarations: [TasksComponent],
  imports: [
    SharedModule,
    TasksRoutingModule
  ]
})
export class TasksModule { }
