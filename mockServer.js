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

// Конфигурация данных
const DATA_CONFIG = {
  count: 2500000,
  departments: ['IT', 'HR', 'Sales', 'Marketing'],
  companies: ['Company A', 'Company B', 'Company C'],
  jobs: ['Developer', 'Manager', 'Director']
};

async function generateMockData() {
  console.log('[SERVER] ⏳ Generating mock data...');
  
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
    console.log(`[SERVER] Generated chunk ${i + 1}/${chunks} (${end} records)`);
  }

  writeFileSync(DATA_FILE, JSON.stringify(allData));
  console.log(`[SERVER] ✅ Mock data generated (${DATA_CONFIG.count} records)`);
}

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  }));

  app.use(bodyParser.json({ limit: '10mb' }));

  // Логирование запросов
  app.use((req, _, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });

  // Проверка существования файла данных
  if (!existsSync(DATA_FILE)) {
    console.error('[SERVER] ❌ Data file not found. Run with --generate first.');
    process.exit(1);
  }

  // Загрузка данных
  console.log('[SERVER] ⏳ Loading data...');
  const rawData = readFileSync(DATA_FILE, 'utf-8');
  const data = JSON.parse(rawData);
  console.log(`[SERVER] ✅ Loaded ${data.length} records`);

  // API Endpoints
  app.get('/api/users/paginated', (req, res) => {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 50;
    const start = page * size;
    const end = start + size;

    res.json({
      data: data.slice(start, end),
      total: data.length,
      page,
      size
    });
  });

  app.get('/api/users/filter', (req, res) => {
    const { department, company, age } = req.query;
    let filtered = [...data];

    if (department) {
      filtered = filtered.filter(u => u.department === department);
    }
    if (company) {
      filtered = filtered.filter(u => u.company === company);
    }
    if (age) {
      filtered = filtered.filter(u => u.age === parseInt(age));
    }

    res.json(filtered);
  });

  app.patch('/api/users/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = data.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    data[userIndex] = { ...data[userIndex], ...req.body };
    res.json(data[userIndex]);
  });

  // Запуск сервера
  app.listen(PORT, () => {
    console.log(`[SERVER] 🚀 Running on http://localhost:${PORT}`);
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
    console.error('[SERVER] ❌ Fatal error:', err);
    process.exit(1);
  }
})();