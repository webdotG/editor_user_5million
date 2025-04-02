
##  Стек
- React + TypeScript
- Redux Toolkit
- React-Window (виртуализация списка)
- SCSS модули

## Структура 

```
src/
├── mockServer.js 
├── mockUsers.json        # База данных (1,000,000 пользователей)
├── App.tsx
├── main.tsx
├── store/
│ ├── store.ts            # Redux store
│ └── usersSlice.ts
├── components/
│ └── EditUser/
│ ├───EditingUser/        # Компонент редактирования
│ ├── EditingUser.tsx
│ └── .module.scss
│ ├───UsersList/          # Список пользователей
│ ├── UsersList.tsx
│ └── .module.scss
│ ├── UserEditor.tsx      # Общий редактор
│ └── .module.scss
└── styles/
└── App.module.scss 
```

## Установка и запуск

```bash
# 1. Генерация тестовых данных (1,000,000 пользователей)
node mockServer.js --generate

# 2. Запуск mock-сервера (localhost:6969)
node mockServer.js

# 3. Запуск клиента (localhost:5173)
npm run dev
```

Модель данных

```typescript

interface User {
  id: number;
  name: string;
  surname: string;
  age: number;
  email: string;
  department: string;
  company: string;
  jobTitle: string;
}
```


Оптимизации

```
- Виртуализация списка (react-window) - рендерим только видимые элементы
- Пакетная загрузка данных (чанками)
- Мемоизация компонентов
- Подгрузка при скролле вниз
- Сохранение позиции при пагинации
- Дебаунс запросов
```