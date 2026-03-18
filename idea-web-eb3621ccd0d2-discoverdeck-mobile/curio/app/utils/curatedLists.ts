import { mockApps } from '../data/mockApps';

export const getCuratedLists = async () => {
  return [
    {
      title: 'Top Productivity Apps',
      apps: mockApps.filter(app => app.category === 'productivity').slice(0, 5)
    },
    {
      title: 'Best Health & Fitness',
      apps: mockApps.filter(app => app.category === 'health').slice(0, 5)
    },
    {
      title: 'Essential Travel Tools',
      apps: mockApps.filter(app => app.category === 'travel').slice(0, 5)
    },
    {
      title: 'Top Gaming Picks',
      apps: mockApps.filter(app => app.category === 'gaming').slice(0, 5)
    },
    {
      title: 'Learning & Education',
      apps: mockApps.filter(app => app.category === 'education').slice(0, 5)
    }
  ];
};
