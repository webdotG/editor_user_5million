import { faker } from '@faker-js/faker';

// Генерация порциями по 100K для избежания блокировки
const generateUsersBatch = (start: number, end: number) => {
  const batch = [];
  for (let i = start; i < end; i++) {
    batch.push({
      id: i + 1,
      name: faker.person.firstName(),
      surname: faker.person.lastName(),
      age: faker.number.int({ min: 18, max: 90 }),
      email: faker.internet.email(),
      department: faker.commerce.department(),
      company: faker.company.name(),
      jobTitle: faker.person.jobTitle()
    });
  }
  return batch;
};

self.onmessage = async (e) => {
  try {
    const { count } = e.data;
    const BATCH_SIZE = 100000;
    const users = [];
    
    for (let i = 0; i < count; i += BATCH_SIZE) {
      const batch = generateUsersBatch(i, Math.min(i + BATCH_SIZE, count));
      users.push(...batch);
      
      if (i % 500000 === 0) {
        self.postMessage({ 
          type: 'progress', 
          loaded: i, 
          total: count 
        });
      }
    }

    self.postMessage(users);
  } catch (error) {
    self.postMessage({ type: 'error', error});
  }
};