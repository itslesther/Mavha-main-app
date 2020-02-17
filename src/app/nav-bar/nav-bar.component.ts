import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { User } from '../shared/interfaces';
import { Router } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {
  public userInfo: User;
  public userSub: Subscription;

  constructor(
    private authService: AuthService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.userSub = this.authService.userInfo$.subscribe(userInfo => {
      this.userInfo = userInfo
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  public logout() {
    this.authService.logout();
  }


}
