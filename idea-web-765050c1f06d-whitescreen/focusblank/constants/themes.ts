export const defaultThemes = [
  {
    id: 'minimal',
    name: 'Minimal',
    background: '#FFFFFF',
    text: '#000000',
    dark: false,
  },
  {
    id: 'warm',
    name: 'Warm',
    background: '#FFF8F0',
    text: '#5D4037',
    dark: false,
  },
  {
    id: 'cool',
    name: 'Cool',
    background: '#F0F4FF',
    text: '#1A237E',
    dark: false,
  },
  {
    id: 'nature',
    name: 'Nature',
    background: '#E8F5E9',
    text: '#1B5E20',
    dark: false,
  },
  {
    id: 'night',
    name: 'Night',
    background: '#121212',
    text: '#FFFFFF',
    dark: true,
  },
];

export const premiumThemes = [
  {
    id: 'sunset',
    name: 'Sunset',
    background: '#FFE0B2',
    text: '#BF360C',
    dark: false,
  },
  {
    id: 'ocean',
    name: 'Ocean',
    background: '#E1F5FE',
    text: '#01579B',
    dark: false,
  },
  // Additional premium themes would go here
];


+++++ focusblank/constants/focusModes.ts
export const defaultFocusModes = [
  {
    id: 'work',
    name: 'Work',
    color: '#3498DB',
    allowedApps: [
      'mail',
      'calendar',
      'notes',
      'messages',
      'files',
      'browser',
      'slack',
      'zoom',
      'asana',
      'trello',
    ],
  },
  {
    id: 'study',
    name: 'Study',
    color: '#2ECC71',
    allowedApps: [
      'notes',
      'calendar',
      'files',
      'browser',
      'notion',
      'goodnotes',
      'anki',
      'duolingo',
    ],
  },
  {
    id: 'relax',
    name: 'Relax',
    color: '#F39C12',
    allowedApps: [
      'music',
      'podcasts',
      'books',
      'weather',
      'calendar',
      'notes',
    ],
  },
  {
    id: 'sleep',
    name: 'Sleep',
    color: '#9B59B6',
    allowedApps: [
      'clock',
      'alarm',
      'books',
      'music',
      'podcasts',
      'notes',
    ],
  },
];

export const premiumFocusModes = [
  {
    id: 'meditate',
    name: 'Meditate',
    color: '#1ABC9C',
    allowedApps: [
      'calm',
      'headspace',
      'insighttimer',
      'breath',
      'notes',
    ],
  },
  {
    id: 'exercise',
    name: 'Exercise',
    color: '#E74C3C',
    allowedApps: [
      'fitness',
      'strava',
      'nike',
      'myfitnesspal',
      'notes',
    ],
  },
  // Additional premium modes would go here
];
