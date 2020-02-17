import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  public loading = true;

  constructor(private router: Router) {

  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.router.events.subscribe(event => {
      if(event instanceof NavigationStart) this.loading = true;
      
      else if(event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loading = false;
        // console.log(this.router.url);
      }
    });
  }
}
