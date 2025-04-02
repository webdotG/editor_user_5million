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

interface UserFilters {
  name?: string;
  email?: string;
  department?: string;
  company?: string;
  jobTitle?: string;
}


Поступаем так :
- node mockServer.js --generate   (создаём моковую бд на 1000000)
- node mockServer.js              (запускаем бд localhost:6969)
- npm run dev                     (запускаем клиента на localhost:5173 )



src/
├── mockServer.js       
├── mockUsers.json      # БД 
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
│           ├── UsersList.tsx            
│           └── .module.scss 
│     ├── UserEditor.tsx          
│     └── .module.scss
└── styles/
    └── App.module.scss       



    Генерация:
        Результат сохраняется в Redux store
        
    Фильтрация/сортировка:
        Пользователь взаимодействует с UI
        Результат сохраняется в store

```