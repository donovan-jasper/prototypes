export interface MockApp {
  name: string;
  description: string;
  icon: string;
  storeUrl: string;
  category: string;
  tags: string[];
  useCases: string[];
  rating: number;
}

export const mockApps: MockApp[] = [
  // Productivity Apps
  {
    name: 'Notion',
    description: 'All-in-one workspace for notes, tasks, wikis, and databases',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/notion/id1232780281',
    category: 'productivity',
    tags: ['notes', 'tasks', 'collaboration', 'workspace', 'organization'],
    useCases: ['project management', 'note-taking', 'team collaboration', 'personal wiki'],
    rating: 4.8
  },
  {
    name: 'Todoist',
    description: 'Simple yet powerful task manager and to-do list app',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/todoist/id572688855',
    category: 'productivity',
    tags: ['tasks', 'to-do', 'reminders', 'productivity', 'organization'],
    useCases: ['task management', 'daily planning', 'project tracking', 'habit building'],
    rating: 4.7
  },
  {
    name: 'Trello',
    description: 'Visual project management with boards, lists, and cards',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/trello/id461504587',
    category: 'productivity',
    tags: ['project management', 'kanban', 'collaboration', 'workflow'],
    useCases: ['team projects', 'workflow management', 'task tracking', 'agile planning'],
    rating: 4.6
  },
  {
    name: 'Evernote',
    description: 'Note-taking app with powerful organization and search',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/evernote/id281796108',
    category: 'productivity',
    tags: ['notes', 'organization', 'documents', 'scanning'],
    useCases: ['note-taking', 'document scanning', 'research organization', 'meeting notes'],
    rating: 4.5
  },
  {
    name: 'Microsoft To Do',
    description: 'Smart task management with intelligent suggestions',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/microsoft-to-do/id1212616790',
    category: 'productivity',
    tags: ['tasks', 'lists', 'reminders', 'microsoft'],
    useCases: ['daily tasks', 'shopping lists', 'work planning', 'personal organization'],
    rating: 4.6
  },
  {
    name: 'Slack',
    description: 'Team communication and collaboration platform',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/slack/id618783545',
    category: 'productivity',
    tags: ['communication', 'team', 'messaging', 'collaboration'],
    useCases: ['team chat', 'project communication', 'file sharing', 'remote work'],
    rating: 4.7
  },
  {
    name: 'Asana',
    description: 'Work management platform for teams and projects',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/asana/id489969512',
    category: 'productivity',
    tags: ['project management', 'tasks', 'team', 'workflow'],
    useCases: ['project planning', 'team coordination', 'deadline tracking', 'workflow automation'],
    rating: 4.5
  },

  // Password Managers
  {
    name: '1Password',
    description: 'Secure password manager and digital vault',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/1password/id568903335',
    category: 'password manager',
    tags: ['security', 'passwords', 'vault', 'encryption'],
    useCases: ['password storage', 'secure notes', 'credit card storage', 'identity protection'],
    rating: 4.8
  },
  {
    name: 'LastPass',
    description: 'Password manager with autofill and secure sharing',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/lastpass/id324613447',
    category: 'password manager',
    tags: ['passwords', 'security', 'autofill', 'vault'],
    useCases: ['password management', 'secure sharing', 'form filling', 'password generation'],
    rating: 4.6
  },
  {
    name: 'Bitwarden',
    description: 'Open-source password manager with cloud sync',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/bitwarden/id1137397744',
    category: 'password manager',
    tags: ['passwords', 'open-source', 'security', 'encryption'],
    useCases: ['password storage', 'secure notes', 'two-factor auth', 'password sharing'],
    rating: 4.7
  },
  {
    name: 'Dashlane',
    description: 'Password manager with dark web monitoring',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/dashlane/id517914548',
    category: 'password manager',
    tags: ['passwords', 'security', 'monitoring', 'vpn'],
    useCases: ['password management', 'identity monitoring', 'secure browsing', 'password health'],
    rating: 4.5
  },

  // Note-Taking Apps
  {
    name: 'Bear',
    description: 'Beautiful writing app for notes and prose',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/bear/id1016366447',
    category: 'note-taking',
    tags: ['notes', 'writing', 'markdown', 'organization'],
    useCases: ['note-taking', 'writing', 'journaling', 'code snippets'],
    rating: 4.8
  },
  {
    name: 'Obsidian',
    description: 'Knowledge base that works on local markdown files',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/obsidian/id1557175442',
    category: 'note-taking',
    tags: ['notes', 'markdown', 'knowledge', 'linking'],
    useCases: ['personal knowledge base', 'research notes', 'zettelkasten', 'writing'],
    rating: 4.7
  },
  {
    name: 'GoodNotes',
    description: 'Digital notebook for handwriting and PDF annotation',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/goodnotes-5/id1444383602',
    category: 'note-taking',
    tags: ['handwriting', 'notes', 'pdf', 'annotation'],
    useCases: ['handwritten notes', 'pdf annotation', 'digital planning', 'studying'],
    rating: 4.9
  },
  {
    name: 'Notability',
    description: 'Note-taking with audio recording and handwriting',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/notability/id360593530',
    category: 'note-taking',
    tags: ['notes', 'handwriting', 'audio', 'annotation'],
    useCases: ['lecture notes', 'meeting notes', 'sketching', 'document annotation'],
    rating: 4.7
  },

  // Calendar Apps
  {
    name: 'Fantastical',
    description: 'Calendar app with natural language input',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/fantastical/id718043190',
    category: 'calendar',
    tags: ['calendar', 'scheduling', 'events', 'reminders'],
    useCases: ['event scheduling', 'meeting planning', 'time management', 'calendar sync'],
    rating: 4.8
  },
  {
    name: 'Google Calendar',
    description: 'Smart calendar with event suggestions and reminders',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/google-calendar/id909319292',
    category: 'calendar',
    tags: ['calendar', 'google', 'scheduling', 'events'],
    useCases: ['event management', 'meeting scheduling', 'reminders', 'team calendars'],
    rating: 4.6
  },
  {
    name: 'Calendly',
    description: 'Automated scheduling and meeting booking',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/calendly/id1451094657',
    category: 'calendar',
    tags: ['scheduling', 'meetings', 'booking', 'automation'],
    useCases: ['meeting scheduling', 'appointment booking', 'availability sharing', 'client meetings'],
    rating: 4.7
  },

  // Health & Fitness Apps
  {
    name: 'MyFitnessPal',
    description: 'Calorie counter and nutrition tracker',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/myfitnesspal/id341232718',
    category: 'health',
    tags: ['fitness', 'nutrition', 'calories', 'diet'],
    useCases: ['calorie tracking', 'meal planning', 'weight loss', 'nutrition monitoring'],
    rating: 4.6
  },
  {
    name: 'Strava',
    description: 'Social network for athletes and fitness tracking',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/strava/id426826309',
    category: 'health',
    tags: ['fitness', 'running', 'cycling', 'tracking'],
    useCases: ['run tracking', 'cycling routes', 'fitness challenges', 'athlete community'],
    rating: 4.7
  },
  {
    name: 'Headspace',
    description: 'Meditation and mindfulness made simple',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/headspace/id493145008',
    category: 'health',
    tags: ['meditation', 'mindfulness', 'mental health', 'wellness'],
    useCases: ['meditation', 'stress relief', 'sleep improvement', 'mindfulness practice'],
    rating: 4.8
  },
  {
    name: 'Calm',
    description: 'Sleep, meditation, and relaxation app',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/calm/id571800810',
    category: 'health',
    tags: ['meditation', 'sleep', 'relaxation', 'mental health'],
    useCases: ['sleep stories', 'meditation', 'anxiety relief', 'relaxation'],
    rating: 4.8
  },
  {
    name: 'Peloton',
    description: 'Home fitness with live and on-demand classes',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/peloton/id792750948',
    category: 'health',
    tags: ['fitness', 'workouts', 'classes', 'training'],
    useCases: ['home workouts', 'cycling classes', 'strength training', 'yoga'],
    rating: 4.7
  },
  {
    name: 'Nike Training Club',
    description: 'Free workouts and training plans from Nike',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/nike-training-club/id301521403',
    category: 'health',
    tags: ['fitness', 'workouts', 'training', 'exercise'],
    useCases: ['home workouts', 'strength training', 'cardio', 'flexibility'],
    rating: 4.8
  },

  // Sleep Tracking Apps
  {
    name: 'Sleep Cycle',
    description: 'Intelligent alarm clock and sleep tracker',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/sleep-cycle/id320606217',
    category: 'sleep tracking',
    tags: ['sleep', 'tracking', 'alarm', 'health'],
    useCases: ['sleep tracking', 'smart alarm', 'sleep analysis', 'snore detection'],
    rating: 4.6
  },
  {
    name: 'AutoSleep',
    description: 'Automatic sleep tracker for Apple Watch',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/autosleep/id1164801111',
    category: 'sleep tracking',
    tags: ['sleep', 'apple watch', 'tracking', 'health'],
    useCases: ['automatic sleep tracking', 'sleep quality', 'heart rate monitoring', 'sleep goals'],
    rating: 4.7
  },
  {
    name: 'Pillow',
    description: 'Sleep tracker with audio recordings and analysis',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/pillow/id878691772',
    category: 'sleep tracking',
    tags: ['sleep', 'tracking', 'audio', 'analysis'],
    useCases: ['sleep tracking', 'snore recording', 'sleep stages', 'nap tracking'],
    rating: 4.5
  },

  // Meditation Apps
  {
    name: 'Insight Timer',
    description: 'Free meditation app with thousands of guided sessions',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/insight-timer/id337472899',
    category: 'meditation',
    tags: ['meditation', 'mindfulness', 'free', 'community'],
    useCases: ['guided meditation', 'music for meditation', 'sleep sounds', 'mindfulness courses'],
    rating: 4.8
  },
  {
    name: 'Ten Percent Happier',
    description: 'Meditation for skeptics and beginners',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/ten-percent-happier/id992210239',
    category: 'meditation',
    tags: ['meditation', 'mindfulness', 'beginner', 'practical'],
    useCases: ['meditation practice', 'stress management', 'sleep improvement', 'anxiety relief'],
    rating: 4.7
  },
  {
    name: 'Waking Up',
    description: 'Meditation and philosophy from Sam Harris',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/waking-up/id1307736395',
    category: 'meditation',
    tags: ['meditation', 'philosophy', 'mindfulness', 'consciousness'],
    useCases: ['meditation practice', 'philosophical exploration', 'mindfulness training', 'consciousness study'],
    rating: 4.9
  },

  // Travel Apps
  {
    name: 'Google Maps',
    description: 'Navigation, transit, and local exploration',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/google-maps/id585027354',
    category: 'travel',
    tags: ['maps', 'navigation', 'transit', 'directions'],
    useCases: ['navigation', 'local search', 'transit directions', 'traffic updates'],
    rating: 4.7
  },
  {
    name: 'Airbnb',
    description: 'Book unique homes and experiences worldwide',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/airbnb/id401626263',
    category: 'travel',
    tags: ['accommodation', 'travel', 'booking', 'vacation'],
    useCases: ['vacation rentals', 'travel booking', 'local experiences', 'trip planning'],
    rating: 4.8
  },
  {
    name: 'Hopper',
    description: 'Flight and hotel booking with price predictions',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/hopper/id904052407',
    category: 'travel',
    tags: ['flights', 'hotels', 'booking', 'deals'],
    useCases: ['flight booking', 'price tracking', 'hotel deals', 'travel planning'],
    rating: 4.6
  },
  {
    name: 'TripIt',
    description: 'Travel organizer and itinerary planner',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/tripit/id311035142',
    category: 'travel',
    tags: ['itinerary', 'planning', 'organization', 'travel'],
    useCases: ['trip organization', 'itinerary management', 'travel documents', 'flight tracking'],
    rating: 4.7
  },
  {
    name: 'Citymapper',
    description: 'Urban transit navigation and journey planning',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/citymapper/id469463298',
    category: 'travel',
    tags: ['transit', 'navigation', 'urban', 'public transport'],
    useCases: ['public transit', 'city navigation', 'route planning', 'real-time updates'],
    rating: 4.8
  },
  {
    name: 'PackPoint',
    description: 'Smart packing list based on trip details',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/packpoint/id896337401',
    category: 'travel',
    tags: ['packing', 'travel', 'checklist', 'planning'],
    useCases: ['packing lists', 'travel preparation', 'trip planning', 'luggage organization'],
    rating: 4.5
  },

  // Gaming Apps
  {
    name: 'Steam Link',
    description: 'Stream PC games to your mobile device',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/steam-link/id1246969117',
    category: 'gaming',
    tags: ['gaming', 'streaming', 'pc', 'remote'],
    useCases: ['game streaming', 'remote gaming', 'pc to mobile', 'controller support'],
    rating: 4.3
  },
  {
    name: 'Discord',
    description: 'Voice, video, and text chat for gamers',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/discord/id985746746',
    category: 'gaming',
    tags: ['chat', 'voice', 'community', 'gaming'],
    useCases: ['gaming chat', 'community building', 'voice calls', 'server management'],
    rating: 4.7
  },
  {
    name: 'Twitch',
    description: 'Live streaming platform for gamers',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/twitch/id460177396',
    category: 'gaming',
    tags: ['streaming', 'gaming', 'live', 'entertainment'],
    useCases: ['watch streams', 'gaming content', 'live chat', 'esports'],
    rating: 4.6
  },
  {
    name: 'Xbox Game Pass',
    description: 'Access to hundreds of games with cloud gaming',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/xbox/id736179781',
    category: 'gaming',
    tags: ['gaming', 'subscription', 'cloud', 'xbox'],
    useCases: ['cloud gaming', 'game library', 'remote play', 'game discovery'],
    rating: 4.5
  },
  {
    name: 'Razer Cortex',
    description: 'Game launcher and performance optimizer',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/razer-cortex/id1234567890',
    category: 'gaming',
    tags: ['gaming', 'optimization', 'launcher', 'performance'],
    useCases: ['game management', 'performance boost', 'game deals', 'system optimization'],
    rating: 4.4
  },

  // Education Apps
  {
    name: 'Duolingo',
    description: 'Learn languages with fun, bite-sized lessons',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/duolingo/id570060128',
    category: 'education',
    tags: ['language', 'learning', 'education', 'gamified'],
    useCases: ['language learning', 'vocabulary building', 'grammar practice', 'daily lessons'],
    rating: 4.7
  },
  {
    name: 'Khan Academy',
    description: 'Free education for anyone, anywhere',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/khan-academy/id469863705',
    category: 'education',
    tags: ['education', 'learning', 'free', 'courses'],
    useCases: ['math learning', 'science education', 'test prep', 'skill building'],
    rating: 4.8
  },
  {
    name: 'Coursera',
    description: 'Online courses from top universities',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/coursera/id736535961',
    category: 'education',
    tags: ['education', 'courses', 'university', 'certificates'],
    useCases: ['online learning', 'professional development', 'degree programs', 'skill certification'],
    rating: 4.6
  },
  {
    name: 'Brilliant',
    description: 'Learn by doing with interactive lessons',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/brilliant/id913335252',
    category: 'education',
    tags: ['education', 'math', 'science', 'interactive'],
    useCases: ['math learning', 'problem solving', 'science education', 'critical thinking'],
    rating: 4.7
  },
  {
    name: 'Anki',
    description: 'Powerful flashcard app with spaced repetition',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/ankimobile-flashcards/id373493387',
    category: 'education',
    tags: ['flashcards', 'learning', 'memory', 'studying'],
    useCases: ['memorization', 'language learning', 'exam prep', 'knowledge retention'],
    rating: 4.8
  },
  {
    name: 'Quizlet',
    description: 'Study tools including flashcards and games',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/quizlet/id546473125',
    category: 'education',
    tags: ['flashcards', 'studying', 'learning', 'education'],
    useCases: ['flashcard creation', 'study games', 'test prep', 'collaborative learning'],
    rating: 4.7
  },
  {
    name: 'Photomath',
    description: 'Scan and solve math problems with step-by-step explanations',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/photomath/id919087726',
    category: 'education',
    tags: ['math', 'education', 'homework', 'calculator'],
    useCases: ['math homework', 'problem solving', 'learning math', 'step-by-step solutions'],
    rating: 4.6
  },

  // Fitness Apps
  {
    name: 'Strong',
    description: 'Workout tracker for strength training',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/strong-workout-tracker/id464254577',
    category: 'fitness',
    tags: ['fitness', 'strength', 'workout', 'tracking'],
    useCases: ['workout logging', 'strength training', 'progress tracking', 'exercise planning'],
    rating: 4.9
  },
  {
    name: 'Fitbod',
    description: 'AI-powered workout planner',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/fitbod/id1041517543',
    category: 'fitness',
    tags: ['fitness', 'ai', 'workout', 'personalized'],
    useCases: ['personalized workouts', 'strength training', 'gym routines', 'progress tracking'],
    rating: 4.8
  },
  {
    name: 'JEFIT',
    description: 'Workout planner and fitness tracker',
    icon: 'https://via.placeholder.com/50',
    storeUrl: 'https://apps.apple.com/app/jefit/id449810000',
    category: 'fitness',
    tags: ['fitness', 'workout', 'tracking', 'bodybuilding'],
    useCases: ['workout planning', 'exercise tracking', 'progress photos', 'community support'],
    rating: 4.7
  }
];
