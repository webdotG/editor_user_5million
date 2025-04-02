import express from 'express';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = 6969;
const DATA_FILE = join(__dirname, 'mockUsers.json');

// Конфигурация генерации тестовых данных
const DATA_CONFIG = {
  count: 1000000,
  departments: ['IT', 'HR', 'Sales', 'Marketing'],
  companies: ['Company A', 'Company B', 'Company C'],
  jobs: ['Developer', 'Manager', 'Director']
};

// Генерация моковых данных
async function generateMockData() {
  console.log('[SERVER] Генерация тестовых данных...');
  
  const chunkSize = 100000;
  const chunks = Math.ceil(DATA_CONFIG.count / chunkSize);
  let allData = [];

  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, DATA_CONFIG.count);
    const chunkData = Array.from({ length: end - start }, (_, idx) => {
      const globalIdx = start + idx;
      return {
        id: globalIdx + 1,
        name: `User${globalIdx}`,
        surname: `Surname${globalIdx % 100}`,
        age: 18 + (globalIdx % 50),
        email: `user${globalIdx}@test.com`,
        department: DATA_CONFIG.departments[globalIdx % DATA_CONFIG.departments.length],
        company: DATA_CONFIG.companies[globalIdx % DATA_CONFIG.companies.length],
        jobTitle: DATA_CONFIG.jobs[globalIdx % DATA_CONFIG.jobs.length]
      };
    });

    allData = [...allData, ...chunkData];
    console.log(`[SERVER] Сгенерирован чанк ${i + 1}/${chunks} (${end} записей)`);
  }

  writeFileSync(DATA_FILE, JSON.stringify(allData));
  console.log(`[SERVER] Тестовые данные сохранены в ${DATA_FILE} (${DATA_CONFIG.count} записей)`);
}

// Основная функция запуска сервера
async function startServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  }));

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Улучшенное логирование
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`, {
      query: req.query,
      body: req.body
    });
    next();
  });

  // Проверка существования файла данных
  if (!existsSync(DATA_FILE)) {
    console.error('[SERVER] Файл данных не найден. Запустите с --generate для создания.');
    process.exit(1);
  }

  // Загрузка данных с обработкой ошибок
  console.log('[SERVER] Загрузка данных из файла...');
  let data = [];
  try {
    const rawData = readFileSync(DATA_FILE, 'utf-8');
    data = JSON.parse(rawData);
    console.log(`[SERVER] Успешно загружено ${data.length} записей`);
  } catch (err) {
    console.error('[SERVER] Ошибка загрузки данных:', err);
    process.exit(1);
  }

  // Эндпоинт для получения пользователей
  app.get('/api/users', (req, res) => {
    try {
      const page = parseInt(req.query.page ) || 0;
      const size = parseInt(req.query.size ) || 50;
      const sortField = (req.query.sort ) || 'name';
      const sortDirection = (req.query.order ) || 'asc';
      const filters = { ...req.query };

      // Удаляем служебные параметры из фильтров
      delete filters.page;
      delete filters.size;
      delete filters.sort;
      delete filters.order;

      console.log('[SERVER] Параметры запроса:', {
        page,
        size,
        sortField,
        sortDirection,
        filters
      });

      let filteredData = [...data];

      // Применяем фильтры
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          filteredData = filteredData.filter(user => 
            String(user[key]).toLowerCase().includes(String(value).toLowerCase())
          );
        }
      });

      // Сортировка
      filteredData.sort((a, b) => {
        const valueA = a[sortField];
        const valueB = b[sortField];

        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return sortDirection === 'asc' 
            ? valueA.localeCompare(valueB)
            : valueB.localeCompare(valueA);
        }
        return sortDirection === 'asc' 
          ? Number(valueA) - Number(valueB)
          : Number(valueB) - Number(valueA);
      });

      // Пагинация
      const start = page * size;
      const end = start + size;
      const paginatedData = filteredData.slice(start, end);

      console.log('[SERVER] Возвращаемые данные:', {
        users: paginatedData.length,
        totalCount: filteredData.length,
        page,
        size
      });

      res.json({
        users: paginatedData,
        totalCount: filteredData.length,
        page,
        size
      });

    } catch (err) {
      console.error('[SERVER] Ошибка обработки запроса:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Эндпоинт для обновления пользователя
  app.patch('/api/users/:id', (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userIndex = data.findIndex(u => u.id === id);

      if (userIndex === -1) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      data[userIndex] = { ...data[userIndex], ...req.body };
      
      console.log('[SERVER] Обновлен пользователь:', data[userIndex]);
      
      res.json(data[userIndex]);
    } catch (err) {
      console.error('[SERVER] Ошибка обновления пользователя:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Обработка 404
  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  // Обработка ошибок
  app.use((err) => {
    console.error('[SERVER] Необработанная ошибка:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  // Запуск сервера
  app.listen(PORT, () => {
    console.log(`[SERVER] Сервер запущен на http://localhost:${PORT}`);
  });
}

// Обработка аргументов командной строки
const args = process.argv.slice(2);
const shouldGenerate = args.includes('--generate');

(async () => {
  try {
    if (shouldGenerate) {
      await generateMockData();
    } else {
      await startServer();
    }
  } catch (err) {
    console.error('[SERVER] Критическая ошибка:', err);
    process.exit(1);
  }
})();