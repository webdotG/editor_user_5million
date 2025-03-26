import { faker } from '@faker-js/faker';

self.onmessage = async (e) => {
  const { count } = e.data;
  
  const generateUsers = (count: number) => {
    const users = [];
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

      if (i % 2500000 === 0) {
        self.postMessage({ progress: i / count });
      }

    }
    return users;
  };

  const users = await generateUsers(count);
  self.postMessage(users);
};

export default {} as typeof Worker & { new(): Worker };