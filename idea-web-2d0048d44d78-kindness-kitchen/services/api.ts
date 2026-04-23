export const mockRestaurants = [
  {
    id: '1',
    name: 'Pizza Palace',
    cuisine: 'Italian',
    rating: 4.5,
    deliveryTime: 30,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '2',
    name: 'Taco Town',
    cuisine: 'Mexican',
    rating: 4.2,
    deliveryTime: 25,
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '3',
    name: 'Burger Barn',
    cuisine: 'American',
    rating: 4.0,
    deliveryTime: 20,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '4',
    name: 'Sushi Spot',
    cuisine: 'Japanese',
    rating: 4.7,
    deliveryTime: 40,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '5',
    name: 'Pasta Paradise',
    cuisine: 'Italian',
    rating: 4.3,
    deliveryTime: 35,
    image: 'https://images.unsplash.com/photo-1555949258-ebd60b6ab041?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '6',
    name: 'Curry Corner',
    cuisine: 'Indian',
    rating: 4.6,
    deliveryTime: 45,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
];

export const getRestaurants = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockRestaurants;
};

export const getRestaurantById = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockRestaurants.find(r => r.id === id);
};
