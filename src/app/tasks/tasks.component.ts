import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ModalDirective, ToastService, PopoverDirective, IMyOptions } from 'ng-uikit-pro-standard';
import { Task, User, APIResponse } from '../shared/interfaces';
import { TasksService } from './tasks.service';
import { FormBuilder, Validators, AbstractControl, FormArray } from '@angular/forms';
import { SharedService } from '../shared/shared.service';
import errorCodes from '../shared/errorCodes';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

declare const tinymce: any;

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

  public loadingMoreTasks: boolean;
  public canLoadMoreTasks: boolean;

  public submitting: boolean;
  public deleting: boolean;

  public loadingTinymce: boolean;

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
  
  public filter = {
    limit: 10,
    startAfter: null,
    // tasks: null,
    creator: null,
    priority: null,
    completed: null,
    sortBy: null,
    direction: 'desc'
  };

  public taskForm = this.fb.group({
    creator: [null],
    title: [''],
    dueDate: [null],
    priority: [null],
    description: [''],
    files: this.fb.array([])
  });

  public description = '';


  constructor(
    private tasksService: TasksService,
    private fb: FormBuilder,
    public sharedService: SharedService,
    private authService: AuthService,
    private toast: ToastService,
  ) { }



  async ngOnInit() {
    this.userSub = this.authService.userInfo$.pipe(filter(userInfo => !!userInfo)).subscribe(userInfo => {
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
        value: 'completed',
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
        value: 'dueDate'
      },
    ]

    await this.getTasks();

  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }


  private async getTasks() {
    this.tasks = null;
    this.filter.startAfter = null;

    const response = await this.tasksService.getTasks(this.filter);

    if (response.success) {
      this.tasks = response.data;
      this.canLoadMoreTasks = this.tasks.length === this.filter.limit;

    } else {
      console.error(response.error.code);
      this.toast.error(errorCodes[response.error.code], '', this.toastOptions);
    }
  }

  public async loadMoreTasks() {
    if(this.loadingMoreTasks) return;

    this.loadingMoreTasks = true;

    this.filter.startAfter = this.tasks[this.tasks.length - 1].id;

    const response = await this.tasksService.getTasks(this.filter);

    if (response.success) {
      const moreTaks: Task[] = response.data;  
      this.tasks.push(...moreTaks);

      this.canLoadMoreTasks = moreTaks.length === this.filter.limit;

    } else {
      console.error(response.error.code);
      this.toast.error(errorCodes[response.error.code], '', this.toastOptions);
    }

    this.loadingMoreTasks = false;
  }




  get files() {
    return this.taskForm.get('files') as FormArray;
  }

  addNewFile() {
    this.files.push(this.fb.group({
      name: [null],
      path: [null],
      url: [null],
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
        
        this.files.controls[index].patchValue({
          uploadPercent,
          uploading: true
        });
      },

      (response: APIResponse) => {
        
        if (response.success) {

          this.files.controls[index].patchValue({
            name: file.name,
            url: response.data.url,
            path: response.data.path,
            uploading: false,
          });
          
        } else {
          this.toast.error(errorCodes[response.error.code], '', this.toastOptions);

          this.files.controls[index].patchValue({
            uploading: false,
          });
        }

      },

      () => {
        this.toast.error(errorCodes.anErrorHasOccured, '', this.toastOptions);
        this.files.controls[index].patchValue({
          uploading: false,
        });
      });


  }


  
  public get isTinymceEditorActive() : boolean {
    return this.tinymceExists && !!tinymce.activeEditor && tinymce.activeEditor.initialized;
  }

  private get tinymceExists() {
    return !!window['tinymce'];
  }


  private initializeTinymce(){
    setTimeout(async () => {
      if(this.isTinymceEditorActive) return;
      this.loadingTinymce = true;
      await this.sharedService.loadScript('tinymce');

      tinymce.init({
        selector: '#tinymceEditor',
        inline: false,
        plugins: 'advlist autolink image lists emoticons code paste wordcount',
        paste_data_images: true,
        toolbar: 'undo redo styleselect bold italic alignleft aligncenter alignright bullist numlist outdent indent',
        min_height: 200,
        init_instance_callback: (editor) => {
          editor.on('change', (e) => {
            this.taskForm.get('description').setValue(tinymce.activeEditor.getContent());
          });
          editor.on('keyup', (e) => {
            this.taskForm.get('description').setValue(tinymce.activeEditor.getContent());
          });
        }
      });
  
      this.loadingTinymce = false;
    });
  }

  private destroyTinymce(){
    setTimeout(() => {
      if(this.isTinymceEditorActive) tinymce.activeEditor.destroy();
    });
  }



  
  closedTaskModal() {
    if(this.taskMenuPopover) this.taskMenuPopover.hide();
    this.destroyTinymce();
    this.description = '';
  }


  openNewTaskModal() {
    this.taskAction = 'new';

    this.resetTaskForm();

    if(this.userInfo) this.taskForm.get('creator').setValue(this.userInfo.id);
    this.taskModal.show();
    this.sortByPopover.hide();
    this.initializeTinymce();
  }


  async openViewTaskModal(taskId: string) {
    this.taskAction = 'view';
    if(!this.taskModal.isShown) this.taskModal.show();
    this.sortByPopover.hide();

    this.selectedTask = null;

    const response = await this.tasksService.getTask(taskId);

    this.destroyTinymce();

    if (response.success) {
      this.selectedTask = response.data;
      
    } else {
      console.error(response.error.code);
      this.toast.error(errorCodes[response.error.code], '', this.toastOptions);
    }
  }


  editTaskModal() {
    this.taskAction = 'edit';
    
    this.resetTaskForm();

    this.selectedTask.files.forEach(file => this.addNewFile());
    this.taskForm.patchValue(this.selectedTask);

    if(this.selectedTask.dueDate) this.taskForm.get('dueDate').setValue(new Date(this.selectedTask.dueDate));
    this.description = this.taskForm.get('description').value;
    this.initializeTinymce();
  }


  private resetTaskForm() {
    this.taskForm.reset();
    this.taskForm.removeControl('files');
    this.taskForm.addControl('files', this.fb.array([]));
  }


  formatDate(unFormatedDate: number) {
    const formatedDate = this.sharedService.formatDate(unFormatedDate);
    return `${formatedDate.month} ${formatedDate.dayOfMonth}, ${formatedDate.year}`;
  }


  async newTask() {
    // if(!this.taskForm.valid) return this.taskForm.markAllAsTouched();

    const req = {...this.taskForm.value}; //CLONE
    req.files = (<any[]>JSON.parse(JSON.stringify(req.files))).filter(file => file.name).map(file => ({name: file.name, url: file.url, path: file.path})); //DEEP CLONE
    req.priority = +req.priority || null;
    if(req.dueDate) req.dueDate = (<Date>req.dueDate).getTime();
    this.taskForm.disable();
    this.submitting = true;

    try {

      const response = await this.tasksService.newTask(req);

      if (response.success) {

        this.toast.success('Task Created','', this.toastOptions);

        const task: Task = {
          id: response.data,
          creator: req.creator,
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
        this.destroyTinymce();
        
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
    // if(!this.taskForm.valid) return this.taskForm.markAllAsTouched();

    const req = {...this.taskForm.value}; //CLONE
    req.files = (<any[]>JSON.parse(JSON.stringify(req.files))).filter(file => file.name).map(file => ({name: file.name, url: file.url, path: file.path})); //DEEP CLONE
    req.priority = +req.priority || null;
    if(req.dueDate) req.dueDate = (<Date>req.dueDate).getTime();

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
        this.taskAction = 'view';
        this.selectedTask = task;
        this.destroyTinymce();

        
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


  async updateTaskStatus(taskId: string, completed: boolean) {
    try {
      const taskFound = this.tasks.find(_task => _task.id === taskId);
      const response = await this.tasksService.updateTaskStatus(taskId, completed);
      
      if (response.success) {
        taskFound.completed = completed;

        if(this.taskAction === 'view') this.selectedTask.completed = completed;

        this.toast.success(`Task ${completed? 'marked' : 'unmarked'} as completed`,'', this.toastOptions);
        
      } else {
        console.error(response.error.code); 
        this.toast.error(errorCodes[response.error.code], '', this.toastOptions);
      }
      
    } catch (err) {
      console.error(err.message || err);
      this.toast.error(errorCodes['anErrorHasOccured'], '', this.toastOptions);
    }
  }

    

  async selectFilterItem(filterValue: string, item: {name: string; value: string; selected: boolean}) {
    if(filterValue === 'tasks') {
      if(item.value === 'mine' && !this.userInfo) return this.toast.info('', 'Log in to view your tasks', this.toastOptions);
      this.filter.creator = item.value === 'mine'? this.userInfo.id : null;
      
    } else {
      this.filter[filterValue] = item.value;
    }

    item.selected = true;

    const filter = this.filtersListItems.find(_filter => _filter.value === filterValue);

    filter.items.forEach(_item => {
      if(_item !== item) _item.selected = false;
    });

    await this.getTasks();
  }


  async selectSortItem(item: {name: string; value: string; selected: boolean}) {
    this.filter.sortBy = item.value;
    this.filter.direction = 'desc'; //DEFAULT
    
    item.selected = true;

    this.sortListItems.forEach(_item => {
      if(_item !== item) _item.selected = false;
    });
    this.sortByPopover.hide();

    await this.getTasks();
  }


  async toggleSortDirection(sortBy: string) {
    if(this.filter.sortBy !== sortBy) return;
    this.filter.direction = this.filter.direction === 'desc'? 'asc' : 'desc';

    await this.getTasks();
  }



  

}
