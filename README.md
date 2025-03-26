# Editor User million's
 type-aware lint rules:

```
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
│   ├── fakerMockData.ts        # Генерация моковых данных
│   └── useWorker.ts            # Web Worker
└── styles/
    └── App.module.scss         # Глобальные стили
```

    Генерация:

        AppInitializer → useInitializeData → dataGenerator.worker.ts

        Результат сохраняется в Redux store

    Фильтрация/сортировка:

        Пользователь взаимодействует с UI

        Вызывается processUsers action

        Данные отправляются в dataProcessor.worker.ts

        Результат возвращается и сохраняется в store