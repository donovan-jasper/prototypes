export interface MockApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  storeUrl: string;
  tags: string[];
  category: string;
  useCases: string[];
  rating: number;
}

export const mockApps: MockApp[] = [
  {
    id: '1',
    name: 'Notion',
    description: 'All-in-one workspace for notes, tasks, wikis, and databases',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/notion',
    tags: ['productivity', 'notes', 'organization', 'collaboration', 'workspace'],
    category: 'productivity',
    useCases: ['take notes', 'organize projects', 'manage tasks', 'create wikis', 'team collaboration'],
    rating: 4.8
  },
  {
    id: '2',
    name: 'Todoist',
    description: 'Simple yet powerful task manager and to-do list app',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/todoist',
    tags: ['productivity', 'tasks', 'todo', 'reminders', 'planning'],
    category: 'productivity',
    useCases: ['manage tasks', 'set reminders', 'organize daily activities', 'track habits'],
    rating: 4.7
  },
  {
    id: '3',
    name: 'Headspace',
    description: 'Meditation and mindfulness made simple',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/headspace',
    tags: ['health', 'meditation', 'mindfulness', 'wellness', 'mental health'],
    category: 'health',
    useCases: ['meditate', 'reduce stress', 'improve sleep', 'practice mindfulness', 'mental wellness'],
    rating: 4.9
  },
  {
    id: '4',
    name: 'MyFitnessPal',
    description: 'Calorie counter and diet tracker for weight loss',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/myfitnesspal',
    tags: ['health', 'fitness', 'diet', 'calories', 'weight loss', 'nutrition'],
    category: 'health',
    useCases: ['track calories', 'lose weight', 'monitor nutrition', 'log meals', 'fitness tracking'],
    rating: 4.6
  },
  {
    id: '5',
    name: 'Duolingo',
    description: 'Learn languages for free with fun, bite-sized lessons',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/duolingo',
    tags: ['education', 'language', 'learning', 'study', 'practice'],
    category: 'education',
    useCases: ['learn languages', 'practice vocabulary', 'study grammar', 'improve pronunciation'],
    rating: 4.7
  },
  {
    id: '6',
    name: 'Khan Academy',
    description: 'Free courses, lessons, and practice in math, science, and more',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/khan-academy',
    tags: ['education', 'learning', 'math', 'science', 'courses', 'study'],
    category: 'education',
    useCases: ['learn math', 'study science', 'take courses', 'practice skills', 'homework help'],
    rating: 4.8
  },
  {
    id: '7',
    name: 'Google Maps',
    description: 'Real-time GPS navigation and local recommendations',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/google-maps',
    tags: ['travel', 'navigation', 'maps', 'directions', 'location'],
    category: 'travel',
    useCases: ['get directions', 'find places', 'navigate', 'explore locations', 'plan routes'],
    rating: 4.5
  },
  {
    id: '8',
    name: 'Airbnb',
    description: 'Book unique homes and experiences around the world',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/airbnb',
    tags: ['travel', 'accommodation', 'booking', 'vacation', 'lodging'],
    category: 'travel',
    useCases: ['book accommodation', 'find vacation rentals', 'plan trips', 'discover experiences'],
    rating: 4.8
  },
  {
    id: '9',
    name: 'Minecraft',
    description: 'Build, explore, and survive in infinite worlds',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/minecraft',
    tags: ['gaming', 'sandbox', 'creative', 'multiplayer', 'adventure'],
    category: 'gaming',
    useCases: ['play games', 'build worlds', 'creative mode', 'multiplayer gaming', 'adventure'],
    rating: 4.6
  },
  {
    id: '10',
    name: 'Among Us',
    description: 'Multiplayer game of teamwork and betrayal',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/among-us',
    tags: ['gaming', 'multiplayer', 'social', 'strategy', 'party game'],
    category: 'gaming',
    useCases: ['play with friends', 'multiplayer gaming', 'party games', 'social gaming'],
    rating: 4.4
  },
  {
    id: '11',
    name: 'Trello',
    description: 'Organize projects with boards, lists, and cards',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/trello',
    tags: ['productivity', 'project management', 'organization', 'collaboration', 'kanban'],
    category: 'productivity',
    useCases: ['manage projects', 'organize tasks', 'team collaboration', 'track progress', 'kanban boards'],
    rating: 4.7
  },
  {
    id: '12',
    name: 'Evernote',
    description: 'Note-taking app for capturing and organizing ideas',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/evernote',
    tags: ['productivity', 'notes', 'organization', 'documents', 'sync'],
    category: 'productivity',
    useCases: ['take notes', 'organize documents', 'save ideas', 'clip web pages', 'sync across devices'],
    rating: 4.5
  },
  {
    id: '13',
    name: 'Calm',
    description: 'Sleep, meditation, and relaxation app',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/calm',
    tags: ['health', 'meditation', 'sleep', 'relaxation', 'wellness', 'mental health'],
    category: 'health',
    useCases: ['improve sleep', 'meditate', 'reduce anxiety', 'relax', 'breathing exercises'],
    rating: 4.8
  },
  {
    id: '14',
    name: 'Strava',
    description: 'Track running and cycling with GPS',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/strava',
    tags: ['health', 'fitness', 'running', 'cycling', 'tracking', 'exercise'],
    category: 'health',
    useCases: ['track runs', 'log cycling', 'monitor fitness', 'join challenges', 'social fitness'],
    rating: 4.6
  },
  {
    id: '15',
    name: 'Coursera',
    description: 'Online courses from top universities and companies',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/coursera',
    tags: ['education', 'learning', 'courses', 'certificates', 'professional development'],
    category: 'education',
    useCases: ['take online courses', 'earn certificates', 'learn new skills', 'professional development'],
    rating: 4.7
  },
  {
    id: '16',
    name: 'Photomath',
    description: 'Scan and solve math problems instantly',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/photomath',
    tags: ['education', 'math', 'homework', 'calculator', 'learning'],
    category: 'education',
    useCases: ['solve math problems', 'homework help', 'learn math', 'step-by-step solutions'],
    rating: 4.8
  },
  {
    id: '17',
    name: 'TripAdvisor',
    description: 'Travel reviews, hotel bookings, and restaurant recommendations',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/tripadvisor',
    tags: ['travel', 'reviews', 'hotels', 'restaurants', 'tourism'],
    category: 'travel',
    useCases: ['find hotels', 'read reviews', 'discover restaurants', 'plan trips', 'book accommodation'],
    rating: 4.6
  },
  {
    id: '18',
    name: 'Hopper',
    description: 'Predict and book flights and hotels at the best prices',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/hopper',
    tags: ['travel', 'flights', 'hotels', 'booking', 'deals', 'price prediction'],
    category: 'travel',
    useCases: ['book flights', 'find deals', 'predict prices', 'save money on travel', 'hotel booking'],
    rating: 4.7
  },
  {
    id: '19',
    name: 'Genshin Impact',
    description: 'Open-world action RPG with stunning visuals',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/genshin-impact',
    tags: ['gaming', 'rpg', 'action', 'adventure', 'open world', 'multiplayer'],
    category: 'gaming',
    useCases: ['play rpg', 'explore worlds', 'action gaming', 'multiplayer adventure'],
    rating: 4.5
  },
  {
    id: '20',
    name: 'Chess.com',
    description: 'Play chess online with millions of players',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/chess',
    tags: ['gaming', 'chess', 'strategy', 'multiplayer', 'puzzles'],
    category: 'gaming',
    useCases: ['play chess', 'solve puzzles', 'learn strategy', 'online multiplayer', 'improve skills'],
    rating: 4.8
  },
  {
    id: '21',
    name: 'Slack',
    description: 'Team communication and collaboration platform',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/slack',
    tags: ['productivity', 'communication', 'collaboration', 'team', 'messaging', 'work'],
    category: 'productivity',
    useCases: ['team chat', 'collaborate', 'share files', 'organize channels', 'remote work'],
    rating: 4.6
  },
  {
    id: '22',
    name: 'Forest',
    description: 'Stay focused and build healthy phone usage habits',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/forest',
    tags: ['productivity', 'focus', 'habits', 'time management', 'wellness'],
    category: 'productivity',
    useCases: ['stay focused', 'reduce phone usage', 'build habits', 'time management', 'productivity'],
    rating: 4.7
  },
  {
    id: '23',
    name: 'Nike Training Club',
    description: 'Free workouts and fitness training programs',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/nike-training-club',
    tags: ['health', 'fitness', 'workout', 'training', 'exercise'],
    category: 'health',
    useCases: ['workout at home', 'fitness training', 'exercise routines', 'build strength', 'cardio'],
    rating: 4.8
  },
  {
    id: '24',
    name: 'Sleep Cycle',
    description: 'Smart alarm clock that tracks your sleep patterns',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/sleep-cycle',
    tags: ['health', 'sleep', 'tracking', 'alarm', 'wellness'],
    category: 'health',
    useCases: ['track sleep', 'smart alarm', 'improve sleep quality', 'sleep analysis', 'wake up refreshed'],
    rating: 4.5
  },
  {
    id: '25',
    name: 'Quizlet',
    description: 'Study tools including flashcards, games, and practice tests',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/quizlet',
    tags: ['education', 'study', 'flashcards', 'learning', 'test prep'],
    category: 'education',
    useCases: ['study flashcards', 'prepare for tests', 'memorize vocabulary', 'practice quizzes'],
    rating: 4.7
  },
  {
    id: '26',
    name: 'Spotify',
    description: 'Music streaming with millions of songs and podcasts',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/spotify',
    tags: ['entertainment', 'music', 'streaming', 'podcasts', 'audio'],
    category: 'productivity',
    useCases: ['listen to music', 'discover podcasts', 'create playlists', 'stream audio', 'background music'],
    rating: 4.8
  },
  {
    id: '27',
    name: 'Canva',
    description: 'Design graphics, presentations, and social media posts',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/canva',
    tags: ['productivity', 'design', 'graphics', 'creative', 'templates'],
    category: 'productivity',
    useCases: ['create graphics', 'design posts', 'make presentations', 'edit photos', 'social media content'],
    rating: 4.8
  },
  {
    id: '28',
    name: 'Splitwise',
    description: 'Split bills and track shared expenses with friends',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/splitwise',
    tags: ['productivity', 'finance', 'expenses', 'bills', 'money', 'sharing'],
    category: 'productivity',
    useCases: ['split bills', 'track expenses', 'share costs', 'manage group finances', 'settle debts'],
    rating: 4.7
  },
  {
    id: '29',
    name: 'Pokémon GO',
    description: 'Explore the real world and catch Pokémon',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/pokemon-go',
    tags: ['gaming', 'ar', 'adventure', 'outdoor', 'collection'],
    category: 'gaming',
    useCases: ['catch pokemon', 'explore outdoors', 'ar gaming', 'collect creatures', 'social gaming'],
    rating: 4.3
  },
  {
    id: '30',
    name: 'Goodreads',
    description: 'Track your reading and discover new books',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/goodreads',
    tags: ['education', 'reading', 'books', 'tracking', 'recommendations'],
    category: 'education',
    useCases: ['track reading', 'discover books', 'read reviews', 'join book clubs', 'set reading goals'],
    rating: 4.6
  }
];
