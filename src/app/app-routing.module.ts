import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { ReversedAuthGuard } from './auth/reversed-auth.guard';


const routes: Routes = [
  {
    path: 'account',
    loadChildren: () => import('./account/account.module').then(mod => mod.AccountModule),
    canActivate: [ReversedAuthGuard]
  },
  {
    path: 'tasks',
    loadChildren: () => import('./tasks/tasks.module').then(mod => mod.TasksModule),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'account/login',
    pathMatch: 'full'
  },
  {
    path: '**', 
    redirectTo: 'account/login', 
    pathMatch: 'full'
  } //PAGE NOT FOUND
  // { path: '**', component: PageNotFoundComponent }   
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
