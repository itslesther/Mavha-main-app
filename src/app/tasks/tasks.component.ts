import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ModalDirective, ToastService, PopoverDirective, IMyOptions } from 'ng-uikit-pro-standard';
import { Task, User, APIResponse } from '../shared/interfaces';
import { TasksService } from './tasks.service';
import { FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';
import { SharedService } from '../shared/shared.service';
import errorCodes from '../shared/errorCodes';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit, OnDestroy {

  @ViewChild('taskModal', {static: false}) public taskModal: ModalDirective;
  @ViewChild('taskMenuPopover', {static: false}) public taskMenuPopover: PopoverDirective;
  groupOptionsSelect: Array<any>;

  public userInfo: User;
  private userSub: Subscription;
  public tasks: Task[];

  public submitting: boolean;

  private toastOptions = this.sharedService.toastOptions;

  public taskAction: 'new' | 'edit' | 'view';

  public dueDateOptions: IMyOptions = {
    // minYear: new Date().getFullYear() - 100,
    closeAfterSelect: true,
    useDateObject: true,
    showTodayBtn: false,
    dateFormat: 'mmmm dd, yyyy'
  };

  public taskForm = this.fb.group({
    creator: ['', [Validators.required]],
    title: ['', [Validators.required]],
    dueDate: ['', [Validators.required]],
    priority: ['', [Validators.required]],
    description: ['', [Validators.required]],
    files: this.fb.array([])
  });


  constructor(
    private tasksService: TasksService,
    private fb: FormBuilder,
    public sharedService: SharedService,
    private authService: AuthService,
    private toast: ToastService,
  ) { }

  async ngOnInit() {
    this.userSub = this.authService.userInfo$.subscribe(userInfo => {
      this.userInfo = userInfo;
      this.taskForm.get('creator').setValue(this.userInfo.id);
    });

    const response = await this.tasksService.getTasks();

    if (response.success) {
      this.tasks = response.data;
    } else {
      
    }

    this.groupOptionsSelect = [
    { value: '', label: 'team 1', group: true },
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '', label: 'team 2', group: true },
    { value: '3', label: 'Option 3' },
    { value: '4', label: 'Option 4' },
    ];
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }


  public invalidField(field: AbstractControl) {
    return this.sharedService.invalidField(field);
  }

  get files() {
    return this.taskForm.get('files') as FormArray;
  }

  addNewFile() {
    this.files.push(this.fb.group({
      name: ['', [Validators.required]],
      url: ['', [Validators.required]]
    }));
  }

  removeFile(index: number) {
    this.files.removeAt(index);
  }

  async uploadFile(e: any, index: number) {
    const files = e.target.files as File[];

    if(!files || !(files.length > 0)) return;

    const file = files[0];
    
    e.target.value = '';

    console.log(file);

    const req = new FormData();
    req.append('doc', file);

    await this.tasksService.uploadDocument(req, 
      (uploadPercent) => {
        console.log(uploadPercent);
      },

      (response: APIResponse) => {
        console.log(response);
        if (response.success) {

          this.files.controls[index].setValue({
            name: file.name,
            url: response.data.url
          })
          
        } else {
          
        }

      },
      
      () => {

      });

  	// if (!file.type.match(/image-*/)) return this.toast.error('','Invalid format',this.toastOptions);
      
    // const fileName = this.sharedService.newFileName(file.type); 


    //   this.files.ID = { file, name: fileName, tempName: file.name };
    //   this.files.ID.uploaded = false;
    //   this.files.ID.errorUploading = false;

    //   this.verificationsService.uploadPhoto(this.userInfo.id, this.files.ID.file, this.files.ID.name).subscribe(uploadIDFilePercent => {
    //     this.files.ID.uploading = true;
    //     this.files.ID.uploadIDFilePercent = uploadIDFilePercent;

    //   }, (err)=>{
    //     this.files.ID.uploading = false;
    //     this.files.ID.errorUploading = true;
    //     console.error(err.message);
    //     this.toast.error('','Error uploading file. Try again later', this.toastOptions);

    //   }, async ()=>{
    //     try{
    //       let getImageURL = await this.verificationsService.getImageURL(this.userInfo.id, this.files.ID.name);
    //       this.newVerificationForm.get('govIssuedId.idFile').setValue(getImageURL);
    //       this.files.ID.uploading = false;
    //       this.files.ID.uploaded = true;

    //     }catch(err){
    //       this.files.ID.uploading = false;
    //       this.files.ID.errorUploading = true;
    //       console.error(err.message || err);
    //       this.toast.error('','Error uploading file. Try again later', this.toastOptions);
    //     }
    //   });



  }


  closeTaskModal() {
    this.taskModal.hide();
    if(this.taskMenuPopover) this.taskMenuPopover.hide();
  }

  openNewTaskModal() {
    this.taskModal.show();
    this.taskAction = 'new';
  }

  async newTask() {
    if(!this.taskForm.valid) return this.taskForm.markAllAsTouched();

    const req = {...this.taskForm.value};
    req.dueDate = (<Date>req.dueDate).getTime();

    this.taskForm.disable();
    this.submitting = true;

    try {

      const response = await this.tasksService.newTask(req);

      if (response.success) {

        this.toast.success('Task Created','', this.toastOptions);
        this.taskModal.hide();

        const task: Task = {
          id: response.data,
          creator: this.userInfo.id,
          title: req.title,
          dueDate: req.dueDate,
          priority: req.priority,
          description: req.description,
          completed: false,
          creationTS: Date.now(),
          files: req.files
        };
        this.tasks.unshift(task);
        
      } else {
        console.error(response.error.code); 
        this.toast.error(errorCodes[response.error.code], '', this.toastOptions);
      }
      
    } catch (err) {
      console.error(err.message || err);
      this.toast.error(errorCodes['anErrorHasOccured'], '', this.toastOptions);
    }

    this.taskForm.enable();
    this.submitting = false;
  }

  openViewTaskModal(taskId: string) {
    this.taskModal.show();
    this.taskAction = 'new';
  }

}
