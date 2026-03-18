export interface MockUser {
  id: string;
  name: string;
  hobbies: string[];
}

const firstNames = [
  'Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry',
  'Iris', 'Jack', 'Kate', 'Leo', 'Maya', 'Noah', 'Olivia', 'Paul',
  'Quinn', 'Rachel', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xavier',
  'Yara', 'Zoe', 'Adam', 'Beth', 'Chris', 'Diana'
];

const allHobbies = [
  'hiking', 'reading', 'cooking', 'photography', 'gardening', 'yoga',
  'painting', 'music', 'travel', 'gaming', 'cycling', 'swimming',
  'knitting', 'baking', 'dancing', 'writing', 'fishing', 'pottery',
  'meditation', 'volunteering', 'bird watching', 'chess', 'running',
  'crafts', 'theater', 'astronomy'
];

const getRandomHobbies = (): string[] => {
  const count = Math.floor(Math.random() * 4) + 2; // 2-5 hobbies
  const shuffled = [...allHobbies].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const generateMockUsers = (count: number = 25): MockUser[] => {
  const users: MockUser[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let name: string;
    do {
      name = firstNames[Math.floor(Math.random() * firstNames.length)];
    } while (usedNames.has(name) && usedNames.size < firstNames.length);
    
    usedNames.add(name);
    
    users.push({
      id: `user_${i + 1}`,
      name,
      hobbies: getRandomHobbies()
    });
  }

  return users;
};
