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
  @ViewChild('sortByPopover', {static: false}) public sortByPopover: PopoverDirective;
  
  public userInfo: User;
  private userSub: Subscription;
  
  public tasks: Task[];
  public selectedTask: Task;

  public submitting: boolean;
  public deleting: boolean;

  private toastOptions = this.sharedService.toastOptions;

  public taskAction: 'new' | 'edit' | 'view';

  public dueDateOptions: IMyOptions = {
    // minYear: new Date().getFullYear() - 100,
    closeAfterSelect: true,
    useDateObject: true,
    dateFormat: 'mmmm dd, yyyy'
  };

  public filtersListItems: {
    name: string;
    value: string;
    items: {
        name: string;
        value: any;
        selected?: boolean;
    }[];
  }[];

  public sortListItems: {
    name: string;
    value: string;
    selected?: boolean;
  }[];

  public taskForm = this.fb.group({
    creator: [null],
    title: [null, [Validators.required]],
    dueDate: [null, [Validators.required]],
    priority: [null, [Validators.required]],
    description: [null, [Validators.required]],
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

    this.filtersListItems = [
      {
        name: 'Tasks',
        value: 'tasks',
        items: [
          {
            name: 'All',
            value: null,
            selected: true
          },
          {
            name: 'Mine',
            value: 'mine'
          },
        ]
      },
      {
        name: 'Priority',
        value: 'priority',
        items: [
          {
            name: 'All',
            value: null,
            selected: true
          },
          {
            name: 'Low',
            value: 1
          },
          {
            name: 'Medium',
            value: 2
          },
          {
            name: 'High',
            value: 3
          },
        ]
      },
      {
        name: 'Status',
        value: 'status',
        items: [
          {
            name: 'All',
            value: null,
            selected: true
          },
          {
            name: 'Completed',
            value: true
          },
          {
            name: 'Incomplete',
            value: false
          }
        ]
      }
    ];

    this.sortListItems = [
      {
        name: 'None',
        value: null,
        selected: true
      },
      {
        name: 'Priority',
        value: 'priority'
      },
      {
        name: 'Due Date',
        value: 'due date'
      },
    ]

    const response = await this.tasksService.getTasks();

    if (response.success) {
      this.tasks = response.data;
    } else {
      
    }

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
      name: [null, [Validators.required]],
      path: [null, [Validators.required]],
      url: [null, [Validators.required]],
      uploading: [null],
      uploadPercent: [null]
    }));
  }

  removeFile(index: number) {
    // if(this.files.controls[index].value.path &&
    //   (this.taskAction === 'new' || (this.taskAction === 'edit' && index > this.selectedTask.files.length - 1))
    // ){ 
    //   this.tasksService.deleteDocument({path: this.files.controls[index].value.path});
    // }

    this.files.removeAt(index);
  }


  public get uploadingFiles() {
    return !!(<any[]>this.files.value).find(file => file.uploading);
  }

  async uploadFile(e: any, index: number) {
    const files = e.target.files as File[];

    if(!files || !(files.length > 0)) return;

    const file = files[0];
    
    e.target.value = '';

    console.log(file);

    const req = new FormData();
    req.append('doc', file);

    // if(this.files.controls[index].value.path &&
    //   (this.taskAction === 'new' || (this.taskAction === 'edit' && index > this.selectedTask.files.length - 1))
    // ){
    //   this.tasksService.deleteDocument({path: this.files.controls[index].value.path});
    // }
    
    this.files.controls[index].setValue({
      name: null,
      url: null,
      path: null,
      uploading: null,
      uploadPercent: null
    });

    this.tasksService.uploadDocument(req, 
      (uploadPercent: number) => {
        console.log(uploadPercent);
        this.files.controls[index].patchValue({
          uploadPercent,
          uploading: true
        });
      },

      (response: APIResponse) => {
        console.log(response);
        if (response.success) {

          this.files.controls[index].patchValue({
            name: file.name,
            url: response.data.url,
            path: response.data.path,
            uploading: false,
          });
          
        } else {
          this.files.controls[index].patchValue({
            uploading: false,
          });
        }

      },

      () => {
        this.files.controls[index].patchValue({
          uploading: false,
        });
      });


  }


  closeTaskModal() {
    this.taskModal.hide();
    if(this.taskMenuPopover) this.taskMenuPopover.hide();
  }

  openNewTaskModal() {
    this.taskForm.reset();
    // this.taskForm.get('dueDate').setValue(null); //VARIABLE NOT BEING RESET
    this.taskModal.show();
    this.sortByPopover.hide();
    this.taskAction = 'new';
    this.taskForm.removeControl('files');
    this.taskForm.addControl('files', this.fb.array([]));
  }

  async openViewTaskModal(taskId: string) {
    if(!this.taskModal.isShown) this.taskModal.show();
    this.sortByPopover.hide();
    this.taskAction = 'view';
    this.selectedTask = null;

    const response = await this.tasksService.getTask(taskId);

    if (response.success) {
      this.selectedTask = response.data;
      
    } else {
      
    }
  }

  editTaskModal() {
    this.taskForm.reset();
    this.taskAction = 'edit';
    this.taskForm.removeControl('files');
    this.taskForm.addControl('files', this.fb.array([]));
    this.selectedTask.files.forEach(file => this.addNewFile());
    this.taskForm.patchValue(this.selectedTask);
    this.taskForm.get('dueDate').setValue(new Date(this.selectedTask.dueDate));
  }

  formatDate(unFormatedDate: number) {
    const formatedDate = this.sharedService.formatDate(unFormatedDate);
    return `${formatedDate.month} ${formatedDate.dayOfMonth}, ${formatedDate.year}`;
  }


  async newTask() {
    if(!this.taskForm.valid) return this.taskForm.markAllAsTouched();

    const req = {...this.taskForm.value}; //CLONE
    req.files = (<any[]>JSON.parse(JSON.stringify(req.files))).filter(file => file.name).map(file => ({name: file.name, url: file.url, path: file.path})); //DEEP CLONE
    req.priority = +req.priority;
    req.dueDate = (<Date>req.dueDate).getTime();

    this.taskForm.disable();
    this.submitting = true;

    try {

      const response = await this.tasksService.newTask(req);

      if (response.success) {

        this.toast.success('Task Created','', this.toastOptions);
        // this.taskModal.hide();

        const task: Task = {
          id: response.data,
          creator: this.userInfo? this.userInfo.id : null,
          title: req.title,
          dueDate: req.dueDate,
          priority: req.priority,
          description: req.description,
          completed: false,
          creationTS: Date.now(),
          files: req.files
        };
        this.tasks.unshift(task);

        this.taskAction = 'view';
        this.selectedTask = task;
        
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


  async updateTask() {
    if(!this.taskForm.valid) return this.taskForm.markAllAsTouched();

    const req = {...this.taskForm.value}; //CLONE
    req.files = (<any[]>JSON.parse(JSON.stringify(req.files))).filter(file => file.name).map(file => ({name: file.name, url: file.url, path: file.path})); //DEEP CLONE
    req.priority = +req.priority;
    req.dueDate = (<Date>req.dueDate).getTime();

    this.taskForm.disable();
    this.submitting = true;

    try {

      const task: Task = {
        id: this.selectedTask.id,
        creator: this.selectedTask.creator,
        title: req.title,
        dueDate: req.dueDate,
        priority: req.priority,
        description: req.description,
        completed: this.selectedTask.completed,
        creationTS: this.selectedTask.creationTS,
        files: req.files
      };

      const response = await this.tasksService.updateTask(task);

      if (response.success) {

        this.toast.success('Task Updated','', this.toastOptions);
        // this.taskModal.hide();
        this.taskAction = 'view';
        this.selectedTask = task;

        
        const taskIndex = this.tasks.findIndex(_task => _task.id = task.id);
        this.tasks[taskIndex] = task;
        
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


  async deleteTask() {
    this.deleting = true;

    try {
      const response = await this.tasksService.deleteTask(this.selectedTask.id);

      if(response.success) {

        this.tasks.splice(this.tasks.findIndex(_task => _task.id === this.selectedTask.id), 1);
        this.toast.success('Task Deleted','', this.toastOptions);
        this.taskModal.hide();

      } else {
        console.error(response.error.code); 
        this.toast.error(errorCodes[response.error.code], '', this.toastOptions);
      }
      
    } catch (err) {
      console.error(err.message || err);
      this.toast.error(errorCodes['anErrorHasOccured'], '', this.toastOptions);
    }

    this.deleting = false;

    

  }



    

  async selectFilterItem(filterValue: string, item: {name: string; value: string; selected: boolean}) {
    item.selected = true;

    const filter = this.filtersListItems.find(_filter => _filter.value === filterValue);

    filter.items.forEach(_item => {
      if(_item !== item) _item.selected = false;
    });
  }

  async selectSortItem(item: {name: string; value: string; selected: boolean}) {
    item.selected = true;

    this.sortListItems.forEach(_item => {
      if(_item !== item) _item.selected = false;
    });
    this.sortByPopover.hide();
  }



  

}
