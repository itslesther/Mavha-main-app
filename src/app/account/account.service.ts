import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {APIResponse} from '../shared/interfaces';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from '../auth/auth.service';
import { filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private APIURL = environment.APIURL;

  constructor(
    private router: Router,
    private http: HttpClient,
    private afAuth: AngularFireAuth,
    private authService: AuthService,
  ) { }


  createAccount(req: { firstName: string, lastName: string, email: string, password: string }) {
    return this.http.post<APIResponse>(`${this.APIURL}/account/createAccount`, req, httpOptions).toPromise();
  }

  public loginWithEmailAndPassword(user: { email: string, password: string }) {
    return new Promise(async (resolve, reject) => {
      // await this.afAuth.auth.setPersistence('session'); //local session none
      this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password)
        .then(async (userCredential) => {

          const userInfo = await this.authService.userInfo$.pipe(filter(userInfo => !!userInfo), take(1)).toPromise();
          
          let redirect = '/tasks';
          this.router.navigateByUrl(redirect);
          resolve();

        })
        .catch(err => {
          console.error(err);

          if (err.code === 'auth/user-not-found') {
            reject('Invalid email'); return;
            // reject(this.sharedService.instTrans('account.login.errors.invalidEmail')); return;
          }
          if (err.code === 'auth/invalid-password' || err.code === 'auth/wrong-password') {
            reject('Invalid password'); return;
            // reject(this.sharedService.instTrans('account.login.errors.invalidPassword')); return;
          }
          if (err.code === 'auth/invalid-email') {
            reject('Invalid email format'); return;
            // reject(this.sharedService.instTrans('account.login.errors.invalidEmailFormat')); return;
          }
          if (err.code === 'auth/network-request-failed') {
            reject('Network error. Check internet connection'); return;
            // reject(this.sharedService.instTrans('account.login.errors.networkError')); return;
          }
          reject('An error has occured. Try again later');
          // reject(this.sharedService.instTrans('account.login.errors.anErrorHasOccured'));
        });
    });
  }



}
