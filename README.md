# Editor User million's

```TS

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

export type WorkerMessage = {
  action: 'FILTER' | 'SORT' | 'FILTER_RESULT' | 'SORT_RESULT';
  payload: any;
};


src/
├── App.tsx
├── main.tsx
├── InitializeData/
│   ├── useInitializeData.ts    # Хук для инициализации данных
│   ├── AppInitializer.tsx      # Компонент инициализации
│   └── AppInitializer.module.scss
├── store/
│   ├── store.ts                # Redux store
│   └── usersSlice.ts           # Redux slice
├── components/
│   └── UserEditor/
│       ├── UserEditor.tsx      # Основной компонент
│       └── UserEditor.module.scss
├── utils/
│   ├── fakerDataGenerator.worker.ts  # Генерация моковых данных
│   └── fakerDataProcessor.worker.ts  # Web Worker
└── styles/
    └── App.module.scss         # Глобальные стили


    Генерация:

        AppInitializer → useInitializeData → fakerDataGenerator.worker.ts

        Результат сохраняется в Redux store

    Фильтрация/сортировка:

        Пользователь взаимодействует с UI

        Вызывается processUsers action

        Данные отправляются в fakerDataProcessor.worker.ts

        Результат возвращается и сохраняется в store

```