// Mock API functions - in a real app these would call your backend
export const fetchPlants = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock plant data
  return [
    {
      id: 1,
      name: 'Monstera Deliciosa',
      species: 'Monstera deliciosa',
      acquiredDate: '2023-01-15',
      latestPhoto: 'https://images.unsplash.com/photo-1588172329551-1b8e098485b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      careNotes: 'Water when top 2 inches of soil are dry'
    },
    {
      id: 2,
      name: 'Snake Plant',
      species: 'Sansevieria trifasciata',
      acquiredDate: '2022-11-05',
      latestPhoto: 'https://images.unsplash.com/photo-1588172329551-1b8e098485b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      careNotes: 'Water every 2-3 weeks'
    },
    {
      id: 3,
      name: 'Pothos',
      species: 'Epipremnum aureum',
      acquiredDate: '2023-03-20',
      latestPhoto: 'https://images.unsplash.com/photo-1588172329551-1b8e098485b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      careNotes: 'Water when soil is dry'
    }
  ];
};

export const fetchCareReminders = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock reminder data
  return [
    {
      id: 1,
      plantId: 1,
      type: 'Watering',
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Water thoroughly'
    },
    {
      id: 2,
      plantId: 2,
      type: 'Fertilizing',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Use diluted fertilizer'
    },
    {
      id: 3,
      plantId: 3,
      type: 'Pruning',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Trim yellow leaves'
    }
  ];
};
