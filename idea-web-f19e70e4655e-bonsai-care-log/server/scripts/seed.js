const mongoose = require('mongoose');
const Plant = require('../models/Plant');
const Photo = require('../models/Photo');
const CareReminder = require('../models/CareReminder');
const CommunityPost = require('../models/CommunityPost');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/verdant', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const seedDatabase = async () => {
  try {
    await Plant.deleteMany({});
    await Photo.deleteMany({});
    await CareReminder.deleteMany({});
    await CommunityPost.deleteMany({});

    const plant = await Plant.create({
      name: 'Monstera',
      species: 'Monstera deliciosa',
      acquiredDate: new Date('2022-01-15')
    });

    await Photo.create([
      {
        plantId: plant._id,
        url: '/images/monstera1.jpg',
        caption: 'First day with Monstera',
        date: new Date('2022-01-15')
      },
      {
        plantId: plant._id,
        url: '/images/monstera2.jpg',
        caption: 'Monstera after a month',
        date: new Date('2022-02-15')
      }
    ]);

    await CareReminder.create({
      plantId: plant._id,
      plantName: 'Monstera',
      message: 'Water your Monstera',
      dueDate: new Date('2026-03-20')
    });

    await CommunityPost.create({
      title: 'My Monstera is thriving!',
      content: 'I just adopted a Monstera and it is doing great. Here is a photo of it after a month.',
      author: 'GreenThumb123',
      date: new Date('2022-02-20')
    });

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
