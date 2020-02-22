# To-Do List App (Frontend) for MAvha test

**Note:** [Click here to see the app hosted and running](https://mavha-test.web.app/)

Frontend made in Angular in order to implement a To-Do list app

[Click here to go to Nodejs Backend repository](https://github.com/itslesther/Mavha-main-api)

## Functionalities

 - **Add Task: Add a task to the to-do list**
	Fields: title, due date priority, description, attachments
	
 - **Edit Task: Edit an already created task**
 
 - **Delete Task: Delete an already created tasks**
  
 - **List Tasks: Lists all the tasks in the app. it also has the following functionalities:**

   Filter by: 
	 1. *Tasks*: All tasks in the app. My tasks (when logged in).
	 2. *Priority*: All priorities, low, medium, high.
	 3.  *Status*: All, Completed, imcomplete.

   Sort by (Ascendant/Descendant):
   1. *None*
	2. *Priority*
	3. *Due Date*

   Infinite load pagination: Load of more tasks when total tasks exceeds 10 elements.
   
- **Account Creation and Login: Account creation in order to filter the tasks by the ones created by the user** 

## Environment

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.0.2.

## Development server

Run `npm install` in order to install required dependencies.

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The backend must be running so the app can work.

## Author
Lesther Caballero