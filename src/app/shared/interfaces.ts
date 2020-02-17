export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  creationTS: number;
  status: {
    banned: boolean;
  };
}

export interface Task {
  id: string;
  creator: string;
  title: string;
  dueDate: number;
  priority: 'low' | 'medium' | 'high';
  description: string;
  // status: 'incomplete' | 'completed';
  completed: boolean;
  creationTS: number;
  files: {
    name: string;
    url: string;
  }[];
}


export interface APIResponse {
  success: boolean;
  data: any;
  error: {
    code?: string;
  } 
}