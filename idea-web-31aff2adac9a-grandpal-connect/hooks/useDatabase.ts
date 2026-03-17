import { useEffect, useState } from 'react';
import { initDatabase, insertUser, getUsers } from '@/lib/database';
import { User } from '@/lib/types';
import { INTERESTS } from '@/constants/interests';

const MOCK_USERS: Omit<User, 'id' | 'createdAt'>[] = [
  {
    name: 'Margaret Chen',
    email: 'margaret.chen@example.com',
    age: 68,
    bio: 'Retired teacher who loves gardening and sharing stories',
    interests: ['Gardening', 'Reading', 'History', 'Cooking', 'Knitting'],
    isPremium: true,
    ageGapPreference: 25
  },
  {
    name: 'Robert Williams',
    email: 'robert.williams@example.com',
    age: 72,
    bio: 'Former engineer, passionate about technology and woodworking',
    interests: ['Technology', 'Woodworking', 'Chess', 'History', 'Photography'],
    isPremium: false,
    ageGapPreference: 20
  },
  {
    name: 'Sarah Martinez',
    email: 'sarah.martinez@example.com',
    age: 29,
    bio: 'Marketing professional seeking life advice and mentorship',
    interests: ['Technology', 'Travel', 'Photography', 'Yoga', 'Cooking'],
    isPremium: true,
    ageGapPreference: 30
  },
  {
    name: 'David Thompson',
    email: 'david.thompson@example.com',
    age: 35,
    bio: 'Software developer interested in learning from experienced professionals',
    interests: ['Technology', 'Music', 'Board Games', 'Reading', 'Hiking'],
    isPremium: false,
    ageGapPreference: 25
  },
  {
    name: 'Eleanor Rodriguez',
    email: 'eleanor.rodriguez@example.com',
    age: 65,
    bio: 'Retired nurse who enjoys painting and volunteering',
    interests: ['Art', 'Painting', 'Volunteering', 'Gardening', 'Baking'],
    isPremium: true,
    ageGapPreference: 30
  },
  {
    name: 'James Anderson',
    email: 'james.anderson@example.com',
    age: 70,
    bio: 'History buff and avid traveler with stories to share',
    interests: ['History', 'Travel', 'Photography', 'Writing', 'Languages'],
    isPremium: false,
    ageGapPreference: 20
  },
  {
    name: 'Emily Parker',
    email: 'emily.parker@example.com',
    age: 27,
    bio: 'Graphic designer looking to learn traditional crafts',
    interests: ['Art', 'Crafts', 'Photography', 'Music', 'Knitting'],
    isPremium: true,
    ageGapPreference: 35
  },
  {
    name: 'Thomas Lee',
    email: 'thomas.lee@example.com',
    age: 75,
    bio: 'Retired chef who loves teaching cooking and baking',
    interests: ['Cooking', 'Baking', 'Wine Tasting', 'Gardening', 'Travel'],
    isPremium: true,
    ageGapPreference: 25
  },
  {
    name: 'Jessica Brown',
    email: 'jessica.brown@example.com',
    age: 32,
    bio: 'Teacher interested in intergenerational learning',
    interests: ['Reading', 'Writing', 'History', 'Volunteering', 'Theater'],
    isPremium: false,
    ageGapPreference: 30
  },
  {
    name: 'William Davis',
    email: 'william.davis@example.com',
    age: 69,
    bio: 'Retired pilot with a passion for astronomy and fishing',
    interests: ['Astronomy', 'Fishing', 'Photography', 'Travel', 'Birdwatching'],
    isPremium: false,
    ageGapPreference: 20
  },
  {
    name: 'Linda Garcia',
    email: 'linda.garcia@example.com',
    age: 66,
    bio: 'Yoga instructor and meditation practitioner',
    interests: ['Yoga', 'Meditation', 'Gardening', 'Cooking', 'Reading'],
    isPremium: true,
    ageGapPreference: 25
  },
  {
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    age: 28,
    bio: 'Entrepreneur seeking wisdom from experienced mentors',
    interests: ['Technology', 'Sports', 'Reading', 'Chess', 'Music'],
    isPremium: true,
    ageGapPreference: 35
  },
  {
    name: 'Patricia Wilson',
    email: 'patricia.wilson@example.com',
    age: 71,
    bio: 'Genealogy enthusiast who loves sharing family history research',
    interests: ['Genealogy', 'History', 'Writing', 'Reading', 'Photography'],
    isPremium: false,
    ageGapPreference: 20
  },
  {
    name: 'Christopher Moore',
    email: 'christopher.moore@example.com',
    age: 30,
    bio: 'Musician looking to learn from experienced performers',
    interests: ['Music', 'Dancing', 'Theater', 'Art', 'Photography'],
    isPremium: false,
    ageGapPreference: 30
  },
  {
    name: 'Barbara Taylor',
    email: 'barbara.taylor@example.com',
    age: 67,
    bio: 'Retired librarian passionate about literature and languages',
    interests: ['Reading', 'Languages', 'Writing', 'History', 'Travel'],
    isPremium: true,
    ageGapPreference: 25
  }
];

async function seedDatabase() {
  const existingUsers = await getUsers();
  
  if (existingUsers.length === 0) {
    console.log('Seeding database with mock users...');
    
    for (const mockUser of MOCK_USERS) {
      const user: User = {
        ...mockUser,
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000 // Random date within last 30 days
      };
      
      await insertUser(user);
    }
    
    console.log(`Seeded ${MOCK_USERS.length} mock users`);
  }
}

export function useDatabase() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initialize() {
      try {
        await initDatabase();
        await seedDatabase();
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err as Error);
      }
    }

    initialize();
  }, []);

  return { isInitialized, error };
}
