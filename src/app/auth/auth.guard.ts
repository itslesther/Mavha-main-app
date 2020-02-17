import { Injectable, NgZone } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { filter, switchMap, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private ngZone: NgZone,
    private authService: AuthService
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    let url: string = state.url;
    return this.checkLogin(url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }

  canLoad(route: Route) {
    let url = `/${route.path}`;

    return this.checkLogin(url);
  }



  checkLogin(url: string){
    return this.authService.isAuthenticated$.pipe(
      filter(isAuthenticated => isAuthenticated !== undefined), 
      switchMap(isAuthenticated => this.authService.userInfo$.pipe(
        filter(userInfo => userInfo !== undefined))), 
      take(1),
      map(userInfo => {
        if(userInfo) {
          return true;
        } else {
          this.ngZone.run(() => this.router.navigateByUrl('') );
          return false;
        }
    }));
  }

  
}
