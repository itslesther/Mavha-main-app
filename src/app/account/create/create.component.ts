import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'ng-uikit-pro-standard';
import { SharedService } from 'src/app/shared/shared.service';
import { AuthService } from 'src/app/auth/auth.service';
import { AccountService } from '../account.service';
import errorCodes from 'src/app/shared/errorCodes';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {

  public submitting: boolean;

  private toastOptions = this.sharedService.toastOptions;

  public accountForm = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, this.sharedService.passwordValid()]],
    repeatPassword: ['', [ Validators.required]],
  },{
    validators: this.sharedService.repeatPasswordValid
  });

  constructor(
    public accountService: AccountService,
    private authService: AuthService,
    private router: Router,
    public sharedService: SharedService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
  }

  public invalidField(field: AbstractControl) {
    return this.sharedService.invalidField(field);
  }

  public get emailErrorMessage() {
    const control = this.accountForm.get('email');
    if (control.hasError('email')) return 'Invalid Email Format';
    if (control.hasError('required')) return 'This Field is required';
    else return '';
  }

  public get passwordErrorMessage() {
    const control = this.accountForm.get('password');
    if (control.hasError('invalidPassword')) return 'The password must contain at least: 8 characters, a capitalized letter and a number';
    if (control.hasError('required')) return 'This Field is required';
    else return '';
  }

  public get repeatPasswordErrorMessage() {
    const control = this.accountForm.get('repeatPassword');
    if(this.accountForm.hasError('invalidRepeatPassword')) return 'Passwords must match';
    if(control.hasError('required')) return 'This Field is required';
    return '';
  }

  public async createAccount() {
    if(!this.accountForm.valid) return this.accountForm.markAllAsTouched();

    const req = this.accountForm.value;
    
    this.accountForm.disable();
    this.submitting = true;

    try {
      const response = await this.accountService.createAccount(req);

      if (response.success) {
        await this.accountService.loginWithEmailAndPassword(req);
        this.router.navigateByUrl('/tasks');
        this.toast.success('Account Created', 'Welcome', this.toastOptions);

      } else {
        console.error(response.error.code); 
        this.toast.error(errorCodes[response.error.code], '', this.toastOptions);
      }
      
    } catch (err) {
      console.error(err.message || err);
      this.toast.error(errorCodes['anErrorHasOccured'], '', this.toastOptions);
    }

    this.accountForm.enable();
    this.submitting = false;

  }

}
