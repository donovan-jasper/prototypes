const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');

const initialData = {
  plants: [
    {
      id: 1,
      name: 'Monstera',
      species: 'Monstera deliciosa',
      acquiredDate: '2022-01-15'
    }
  ],
  photos: [
    {
      id: 1,
      plantId: 1,
      url: '/images/monstera1.jpg',
      caption: 'First day with Monstera',
      date: '2022-01-15'
    },
    {
      id: 2,
      plantId: 1,
      url: '/images/monstera2.jpg',
      caption: 'Monstera after a month',
      date: '2022-02-15'
    }
  ],
  careReminders: [
    {
      id: 1,
      plantId: 1,
      plantName: 'Monstera',
      message: 'Water your Monstera',
      dueDate: '2022-03-15'
    }
  ],
  communityPosts: [
    {
      id: 1,
      title: 'My Monstera is thriving!',
      content: 'I just adopted a Monstera and it is doing great. Here is a photo of it after a month.',
      author: 'GreenThumb123',
      date: '2022-02-20'
    }
  ]
};

fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));

console.log('Database setup complete.');
