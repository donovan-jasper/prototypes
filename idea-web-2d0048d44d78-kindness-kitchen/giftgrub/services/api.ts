const mockRestaurants = [
  { id: '1', name: 'Pizza Palace', cuisine: 'Italian', rating: 4.5 },
  { id: '2', name: 'Taco Town', cuisine: 'Mexican', rating: 4.2 },
  { id: '3', name: 'Burger Barn', cuisine: 'American', rating: 4.0 },
  { id: '4', name: 'Sushi Spot', cuisine: 'Japanese', rating: 4.7 },
  { id: '5', name: 'Pasta Place', cuisine: 'Italian', rating: 4.3 },
];

export const useApi = {
  getRestaurants: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockRestaurants;
  },
};
