import { User, WorkerMessage } from '../types';

// Фильтрация пользователей
function filterUsers(users: User[], criteria: Record<string, string>): User[] {
  return users.filter(user => {
    return Object.entries(criteria).every(([key, value]) => {
      if (!value) return true;
      const userValue = String(user[key as keyof User]).toLowerCase();
      const searchValue = String(value).toLowerCase();
      return userValue.includes(searchValue);
    });
  });
}

// Сортировка пользователей
function sortUsers(users: User[], field: keyof User, direction: 'asc' | 'desc'): User[] {
  return [...users].sort((a, b) => {
    const valA = a[field];
    const valB = b[field];
    
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Обработчик сообщений
self.onmessage = function(e: MessageEvent<WorkerMessage>) {
  const { action, payload } = e.data;
  let result: User[] = [];
  
  switch (action) {
    case 'FILTER':
      result = filterUsers(payload.users, payload.criteria);
      break;
      
    case 'SORT':
      result = sortUsers(payload.users, payload.field, payload.direction);
      break;
  }
  
  const response: WorkerMessage = { 
    action: `${action}_RESULT`, 
    payload: result 
  };
  
  self.postMessage(response);
};

// Добавляем TypeScript-тип для self
declare const self: DedicatedWorkerGlobalScope;
export {};