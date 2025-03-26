export interface User {
  id: number;
  name: string;
  surname: string;
  age: number;
  email: string;
  department: string;
  company: string;
  jobTitle: string;
}

export type FilterCriteria = {
  [key in keyof User]?: string;
};

export interface SortConfig {
  field: keyof User;
  direction: 'asc' | 'desc';
}

export interface UsersState {
  users: User[];
  filteredUsers: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  filterCriteria: FilterCriteria;
  sortConfig: SortConfig;
  lastUpdated: string | null;
  initialized: boolean;
  loadProgress: number;
}

export type WorkerMessage = 
  | { type: 'progress'; progress: number; loaded: number; total: number }
  | { type: 'batch'; data: User[] }
  | { type: 'complete' }
  | { type: 'error'; error: string };