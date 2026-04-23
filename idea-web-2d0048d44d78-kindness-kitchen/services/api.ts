export const mockRestaurants = [
  {
    id: '1',
    name: 'Pizza Palace',
    cuisine: 'Italian',
    rating: 4.5,
    deliveryTime: 30,
    price: 25.99,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '2',
    name: 'Taco Town',
    cuisine: 'Mexican',
    rating: 4.2,
    deliveryTime: 25,
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '3',
    name: 'Burger Barn',
    cuisine: 'American',
    rating: 4.0,
    deliveryTime: 20,
    price: 15.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '4',
    name: 'Sushi Spot',
    cuisine: 'Japanese',
    rating: 4.7,
    deliveryTime: 40,
    price: 32.99,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '5',
    name: 'Pasta Paradise',
    cuisine: 'Italian',
    rating: 4.3,
    deliveryTime: 35,
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1555949258-ebd60b6ab041?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '6',
    name: 'Curry Corner',
    cuisine: 'Indian',
    rating: 4.6,
    deliveryTime: 45,
    price: 27.99,
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '7',
    name: 'BBQ Pit',
    cuisine: 'American',
    rating: 4.4,
    deliveryTime: 30,
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '8',
    name: 'Thai Delight',
    cuisine: 'Thai',
    rating: 4.5,
    deliveryTime: 40,
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '9',
    name: 'Mediterranean Bistro',
    cuisine: 'Mediterranean',
    rating: 4.3,
    deliveryTime: 35,
    price: 26.99,
    image: 'https://images.unsplash.com/photo-1555992336-03a23c0c512c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    id: '10',
    name: 'Steakhouse Prime',
    cuisine: 'Steakhouse',
    rating: 4.8,
    deliveryTime: 50,
    price: 45.99,
    image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
];

export const getRestaurants = async (location) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Filter restaurants based on location (simplified)
  // In a real app, this would call a geocoding API and filter by proximity
  return mockRestaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(location.toLowerCase()) ||
    restaurant.cuisine.toLowerCase().includes(location.toLowerCase())
  );
};

export const getRestaurantById = async (id) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockRestaurants.find(r => r.id === id);
};

export const createPaymentIntent = async (amount) => {
  // In a real app, this would call your backend to create a Stripe PaymentIntent
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    clientSecret: 'pi_123456789_secret_123456789',
    amount: amount,
    currency: 'usd',
  };
};
