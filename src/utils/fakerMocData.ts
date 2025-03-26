import { faker } from '@faker-js/faker';
import { User } from '../types';

export const generateMockUsers = (count: number): User[] => {
  const users: User[] = [];
  
  for (let i = 0; i < count; i++) {
    users.push({
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
  
  return users;
};