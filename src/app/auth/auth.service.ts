import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, Subscription, combineLatest} from 'rxjs';
import { Router }  from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import 'firebase/analytics';
import * as firebase from 'firebase/app';
import { filter, take } from 'rxjs/operators';
import {User} from '../shared/interfaces';
import {SharedService} from '../shared/shared.service'
import { ToastService } from 'ng-uikit-pro-standard';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public userInfo$ = new BehaviorSubject<User>(undefined);
  public isAuthenticated$ = new BehaviorSubject<boolean>(undefined);
  private userSession: Subscription;
  public redirectUrl: string;
  public callOnce: boolean;
  private toastOptions = this.sharedService.toastOptions;

  constructor(
    private router: Router,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    public sharedService: SharedService,
    private toast: ToastService
  ) {

    this.afAuth.authState.subscribe(async firebaseUser => {

      if(!firebaseUser) {console.log('here')
        this.isAuthenticated$.next(false);
        this.userInfo$.next(null);
        return;
      }

      this.isAuthenticated$.next(true);
      
      this.userSession = this.getUser$(firebaseUser.uid).subscribe(
        async ([userInfo]) => {
          
        this.userInfo$.next(<User>userInfo);
        
      }, 
      err=>{
        console.error(err);
        this.toast.error('Error logging in','', this.toastOptions);
        this.logout();
      });

      
    });


  }




  public async logout(){
    await this.afAuth.auth.signOut();
    this.userSession.unsubscribe();
    this.userInfo$.pipe(filter(userInfo => userInfo === null), take(1)).subscribe(() => this.router.navigate(['/']));
    // this.toast.success('Logged out successfully','', this.toastOptions);
  }

  private getUser$(uid:string){
    return combineLatest(
      this.afs.doc(`users/${uid}`).valueChanges(),
    ).pipe(filter((a)=> !!a[0]));
  }



}
