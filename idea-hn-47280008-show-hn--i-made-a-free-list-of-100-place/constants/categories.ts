export const CATEGORIES = [
  'App Stores',
  'Startup Directories',
  'Developer Tools',
  'Product Hunt Alternatives',
  'SaaS Directories',
  'AI Tools',
  'No-Code Tools',
  'Design Resources',
  'Marketing Tools',
  'Productivity Apps',
  'Mobile Apps',
  'Web Apps',
  'Chrome Extensions',
  'Open Source',
  'Indie Hackers',
  'Tech News',
  'Communities',
  'Newsletters',
  'Podcasts',
  'Other'
] as const;

export type Category = typeof CATEGORIES[number];
