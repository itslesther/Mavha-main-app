import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../account.service';
import { ToastService } from 'ng-uikit-pro-standard';
import { SharedService } from 'src/app/shared/shared.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public submitting: boolean;

  private toastOptions = this.sharedService.toastOptions;

  public accountForm = this.fb.group({
    email: ['',[ Validators.required, Validators.email ]],
    password: ['',[ Validators.required]],
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    public accountService: AccountService,
    public sharedService: SharedService,
    private toast: ToastService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
  }

  public invalidField(field: AbstractControl){
    return this.sharedService.invalidField(field);
  }


  public get emailErrorMessage() {
    const control = this.accountForm.get('email');
    if (control.hasError('email')) return 'Invalid Email Format';
    if (control.hasError('required')) return 'This Field is required';
    else return '';
  }


  async login() {
    if(!this.accountForm.valid) return this.accountForm.markAllAsTouched();
    
    const req = this.accountForm.value;

    this.accountForm.disable();
    this.submitting = true;

    try {
      await this.accountService.loginWithEmailAndPassword(req);
      
    } catch (err) {
      console.error(err.message || err);
      this.toast.error(err.message || err,'', this.toastOptions);
    }

    this.accountForm.enable();
    this.submitting = false;
  }

}
