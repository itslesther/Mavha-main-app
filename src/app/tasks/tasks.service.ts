import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SharedService } from 'src/app/shared/shared.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { APIResponse, Task } from '../shared/interfaces';


@Injectable({
  providedIn: 'root'
})
export class TasksService {

  private APIURL = environment.APIURL;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private sharedService: SharedService,
  ) { }

  newTask(req: Task) {
    return this.http.post<APIResponse>(`${this.APIURL}/tasks`, req, this.httpOptions).toPromise();
  }

  getTasks() {
    return this.http.get<APIResponse>(`${this.APIURL}/tasks`).toPromise();
  }
  
  getTask(taskId: string) {
    return this.http.get<APIResponse>(`${this.APIURL}/tasks/${taskId}`).toPromise();
  }

  updateTask(req: Task) {
    return this.http.put<APIResponse>(`${this.APIURL}/tasks/${req.id}`, req, this.httpOptions).toPromise();
  }

  deleteTask(taskId: string) {
    return this.http.delete<APIResponse>(`${this.APIURL}/tasks/${taskId}`, this.httpOptions).toPromise();
  }

  public async uploadDocument(req: FormData, progressCb, completeCb, errorCb){
    // const token = await this.sharedService.getToken();
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', oEvent => {if (oEvent.lengthComputable) progressCb(oEvent.loaded / oEvent.total * 100)});
    xhr.addEventListener('load', () => completeCb(JSON.parse(xhr.response)));
    xhr.addEventListener('error', () => errorCb());
    
    xhr.open('POST', `${this.APIURL}/tasks/uploadDocument`);
    // xhr.setRequestHeader('Authorization', token);
    xhr.send(req);
  }


  
}
