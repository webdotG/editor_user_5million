// mockServer.js
import express from 'express';
import { writeFileSync, readFileSync } from 'fs';
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
  console.log('[SERVER] Generating mock data...');
  const data = Array.from({ length: DATA_CONFIG.count }, (_, i) => ({
    id: i + 1,
    name: `User${i}`,
    surname: `Surname${i % 100}`,
    age: 18 + (i % 50),
    email: `user${i}@test.com`,
    department: DATA_CONFIG.departments[i % DATA_CONFIG.departments.length],
    company: DATA_CONFIG.companies[i % DATA_CONFIG.companies.length],
    jobTitle: DATA_CONFIG.jobs[i % DATA_CONFIG.jobs.length]
  }));

  writeFileSync(DATA_FILE, JSON.stringify(data));
  console.log(`[SERVER] Mock data generated (${DATA_CONFIG.count} records)`);
}

async function startServer() {
  const app = express();

  // CORS с динамическими origin
  app.use(cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:5174'
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`[SERVER] CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  }));

  // Логирование всех запросов
  app.use((req, res, next) => {
    const start = Date.now();
    console.log(`[SERVER] ${req.method} ${req.path} from ${req.ip}`);
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[SERVER] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    });
    
    next();
  });

  // Загрузка данных
  let data = [];
  try {
    const rawData = readFileSync(DATA_FILE, 'utf-8');
    data = JSON.parse(rawData);
    console.log(`[SERVER] Loaded ${data.length} records`);
  } catch (err) {
    console.error('[SERVER] Error loading mock data:', err);
    process.exit(1);
  }

  app.use(bodyParser.json());

  // API Endpoints
  app.get('/api/users/paginated', (req, res) => {
    try {
      const page = Number(req.query.page) || 0;
      const size = Number(req.query.size) || 50;
      const start = page * size;
      const end = start + size;
      
      console.log(`[API] Pagination request - page: ${page}, size: ${size}`);
      
      res.json({
        data: data.slice(start, end),
        total: data.length,
        page,
        size
      });
    } catch (error) {
      console.error('[API] Pagination error:', error);
      res.status(500).json({ 
        error: 'Pagination error',
        message: error.message
      });
    }
  });

  // Остальные endpoints...

  app.listen(PORT, () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}/api`);
  });
}

// Запуск
(async () => {
  try {
    // await generateMockData(); // Раскомментировать для генерации данных
    await startServer();
  } catch (err) {
    console.error('[SERVER] Fatal error:', err);
    process.exit(1);
  }
})();