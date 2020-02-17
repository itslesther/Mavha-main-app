import { Injectable, NgZone } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { filter, switchMap, map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReversedAuthGuard implements CanActivate, CanActivateChild, CanLoad {

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


  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.canActivate(next, state);
  }


  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {

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
          this.ngZone.run(() => this.router.navigateByUrl('/tasks') );
          return false;
        } else {
          return true;
        }
    }));
  }

  
}
