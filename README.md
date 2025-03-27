# Editor User million's

```JS

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
}

сначала поступаем так :
переходим в склонированный репозиторий   
npm i 
открываем mockServer.js
находим строку 121
await generateMockData(); раскоментируем её 
запускаем создание базы и поднятия сервер
пишем : node mockServer.js
потом снова открываем файл mockServer.js, находим строку 121
await generateMockData(); комментируем обратно 

src/
├── mockServer.js       # Поднятие сервера localhost_'смотреть в () как единожды создать бд, Внимательно!'
├── mockUsers.json      # БД на 2.5млн юзеров
├── App.tsx
├── main.tsx
├── store/
│   ├── store.ts                
│   └── usersSlice.ts           
├── components/
│   └── EditUser/
│     ├───EditingUser/
│           ├── EditingUser.tsx           
│           └── .module.scss 
│     ├───UsersList/
│           ├── store.ts            
│           └── .module.scss 
│       ├── UserEditor.tsx          
│       └── .module.scss
└── styles/
    └── App.module.scss       


    Генерация:

        

        Результат сохраняется в Redux store

    Фильтрация/сортировка:

        Пользователь взаимодействует с UI

        Результат сохраняется в store

```