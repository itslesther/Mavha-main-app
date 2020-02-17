import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders }from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/analytics';
import { AbstractControl, FormGroup } from '@angular/forms';
import { environment } from '../../environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  public toastOptions = { positionClass:'md-toast-bottom-right', progressBar:true, toastClass:'opacity' };

  public daysOfTheWeekOptions = [
    { value: '0', label: 'Sunday' },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thurday' },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday' },
  ];


  public daysOfTheMonthOptions = [
    { value: '1', label: '1st' },
    { value: '2', label: '2nd' },
    { value: '3', label: '3rd' },
    { value: '4', label: '4th' },
    { value: '5', label: '5th' },
    { value: '6', label: '6th' },
    { value: '7', label: '7th' },
    { value: '8', label: '8th' },
    { value: '9', label: '9th' },
    { value: '10', label: '10th' },
    { value: '11', label: '11st' },
    { value: '12', label: '12th' },
    { value: '13', label: '13rd' },
    { value: '14', label: '14th' },
    { value: '15', label: '15th' },
    { value: '16', label: '16th' },
    { value: '17', label: '17th' },
    { value: '18', label: '18th' },
    { value: '19', label: '19th' },
    { value: '20', label: '20th' },
    { value: '21', label: '21st' },
    { value: '22', label: '22nd' },
    { value: '23', label: '23rd' },
    { value: '24', label: '24th' },
    { value: '25', label: '25th' },
    { value: '26', label: '26th' },
    { value: '27', label: '27th' },
    { value: '28', label: '28th' },
    { value: '29', label: '29th' },
    { value: '30', label: '30th' },
    { value: '31', label: '31st' }
  ];

  public monthsOptions = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'May' },
    { value: '5', label: 'April' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  private scriptStore = [
    {name: 'tinymce', src: `https://cdn.tiny.cloud/1/${environment.tinymceApiKey}/tinymce/5/tinymce.min.js`},
  ];

  private scripts: any = {};

  constructor(
    public afAuth: AngularFireAuth,
    private http: HttpClient,
  ) {

    this.scriptStore.forEach(script => {
      this.scripts[script.name] = {
        loaded: false,
        src: script.src
      };
    });

  }


  public invalidField(field: AbstractControl){
    return field && field.invalid && (field.dirty || field.touched);
  }

  public validField(field: AbstractControl){
    return field && field.valid && (field.dirty || field.touched);
  }

  public repeatPasswordValid(control: FormGroup){
    let password = control.get('password').value;
    let repeatPassword = control.get('repeatPassword').value;
    return password === repeatPassword? null : {invalidRepeatPassword: true};
  }

  public passwordValid(){
    return (control: AbstractControl)=>{
      if(control.dirty) {
        if (control.value.length >= 8) {
          const anUpperCase = /[A-Z]/;
          const aLowerCase = /[a-z]/;
          const aNumber = /[0-9]/;

          let numUpper = 0;
          let numLower = 0;
          let numNums = 0;

          for(let i = 0; i < control.value.length; i++){
            if(anUpperCase.test(control.value[i]))
                numUpper++;
            else if(aLowerCase.test(control.value[i]))
                numLower++;
            else if(aNumber.test(control.value[i]))
                numNums++;
          }

          if(numUpper < 1 || numLower < 1 || numNums < 1){
            return {invalidPassword: true}
          } else {
            return null;
          }
        }else {
          return {invalidPassword: true}
        }
      }
    }
  }

  generateId() {
    return firebase.firestore().collection('uniqueId').doc().id; 
  }

  getToken(){
    return this.afAuth.auth.currentUser.getIdToken();
  }

  async getAuthHeader(){
    return { headers : httpOptions.headers.append('Authorization', await this.getToken()) };
  }

  public loadScript(name: string) {
    return new Promise((resolve, reject) => {
      //resolve if already loaded
      if (this.scripts[name].loaded) {
          resolve({script: name, loaded: true, status: 'Already Loaded'}); return;
      }
      //load script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = this.scripts[name].src;
      if(name = 'tinymce') script.referrerPolicy = 'origin';

      if ((<any>script).readyState) {  //IE
        (<any>script).onreadystatechange = () => {
          if ((<any>script).readyState === "loaded" || (<any>script).readyState === "complete") {
            (<any>script).onreadystatechange = null;
            this.scripts[name].loaded = true;
            resolve({script: name, loaded: true, status: 'Loaded'});
          }
        };

      } else {  //Others
        script.onload = () => {
          this.scripts[name].loaded = true;
          resolve({script: name, loaded: true, status: 'Loaded'});
        };
      }

      script.onerror = (err) => reject({script: name, loaded: false, status: 'Loaded'});
      document.getElementsByTagName('head')[0].appendChild(script);
    });
  }

  public formatDate(unFormatedDate: number | Date){
    let date = new Date(unFormatedDate);
    let obj = {
      dayOfTheWeek : this.daysOfTheWeekOptions.find(option=>option.value==String(date.getDay())).label,
      dayOfMonth : this.daysOfTheMonthOptions.find(option=>option.value==String(date.getDate())).label,
      month : this.monthsOptions.find(option=>option.value==String(date.getMonth()+1)).label,
      year : date.getFullYear(),
      hours : date.getHours(),
      minutes : date.getMinutes(),
      seconds : date.getSeconds()
    
    };
    return obj;  
  }

  public formatToSlashedDate(unFormatedDate: number | Date) {
    let date = new Date(unFormatedDate);
    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
  }


}
