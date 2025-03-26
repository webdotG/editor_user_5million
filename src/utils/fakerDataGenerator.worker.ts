// // Используем более легкий вариант faker
// import { faker } from '@faker-js/faker/locale/en';
// import { User } from '../types';

// // Генерация данных пачками с периодической отдачей контроля
// const generateBatch = (start: number, batchSize: number): User[] => {
//   const batch: User[] = [];
//   const departmentsList = ['IT', 'HR', 'Продажи', 'Маркетинг', 'Производство'];
//   const companiesList = ['Компания А', 'Компания Б', 'Компания В'];
//   const jobTitlesList = ['Разработчик', 'Менеджер', 'Руководитель'];

//   for (let i = 0; i < batchSize; i++) {
//     const company = companiesList[Math.floor(Math.random() * companiesList.length)];
//     const department = departmentsList[Math.floor(Math.random() * departmentsList.length)];
//     const jobTitle = jobTitlesList[Math.floor(Math.random() * jobTitlesList.length)];

//     batch.push({
//       id: start + i + 1,
//       name: faker.person.firstName(),
//       surname: faker.person.lastName(),
//       age: Math.floor(Math.random() * 50) + 18,
//       email: `user${start + i}@test.com`,
//       department: department,
//       company: company,
//       jobTitle: jobTitle
//     });
//   }
//   return batch;
// };

// self.onmessage = async (e: MessageEvent<{ count: number }>) => {
//   try {
//     const { count } = e.data;
//     const BATCH_SIZE = 10000000;
//     const TOTAL_BATCHES = Math.ceil(count / BATCH_SIZE);
    
//     for (let i = 0; i < TOTAL_BATCHES; i++) {
//       const start = i * BATCH_SIZE;
//       const batch = generateBatch(start, Math.min(BATCH_SIZE, count - start));
      
//       self.postMessage({
//         type: 'batch',
//         data: batch
//       });

//       const progress = Math.round((start + batch.length) / count * 100);
//       self.postMessage({
//         type: 'progress',
//         progress,
//         loaded: start + batch.length,
//         total: count
//       });

//       if (i % 5 === 0) await new Promise(resolve => setTimeout(resolve, 0));
//     }

//     self.postMessage({ type: 'complete' });
//   } catch (error) {
//     self.postMessage({
//       type: 'error',
//       error: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// };