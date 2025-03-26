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
  users: [], // Полный список пользователей
  filteredUsers: [], // Отфильтрованный список
  selectedUser: null, // Выбранный пользователь для редактирования
  loading: false, // Флаг загрузки
  error: null, // Ошибки при работе с данными
  filterCriteria: {}, // Текущие критерии фильтрации
  sortConfig: { field: 'name', direction: 'asc' }, // Параметры сортировки
  lastUpdated: null, // Время последнего обновления
  initialized: false, // Флаг инициализации хранилища
  loadProgress: 0, // Прогресс загрузки (0-100)
  currentPage: 0, // Текущая страница пагинации
  pageSize: 50, // Количество элементов на странице
  totalCount: 0 // Общее количество пользователей
  hasMore: boolean;
}

export type WorkerMessage = 
  | { type: 'progress'; progress: number; loaded: number; total: number }
  | { type: 'batch'; data: User[] }
  | { type: 'complete' }
  | { type: 'error'; error: string };