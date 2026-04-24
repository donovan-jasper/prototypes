import { Component } from '@/types/component';
import { IntentResult } from './intentParser';

interface SuggestedScreen {
  name: string;
  components: Component[];
}

export function suggestComponents(intent: IntentResult): SuggestedScreen[] {
  const screens: SuggestedScreen[] = [];

  // Common components for all apps
  const commonComponents: Component[] = [
    {
      id: 'header',
      type: 'header',
      props: {
        title: 'App Name',
        showBackButton: false,
      },
      position: { x: 0, y: 0 },
      order: 0,
    },
    {
      id: 'footer',
      type: 'footer',
      props: {
        items: [
          { label: 'Home', icon: 'home' },
          { label: 'Search', icon: 'search' },
          { label: 'Profile', icon: 'account' },
        ],
      },
      position: { x: 0, y: 'auto' },
      order: 100,
    },
  ];

  // App type specific screens and components
  switch (intent.appType) {
    case 'social':
      screens.push({
        name: 'Feed',
        components: [
          ...commonComponents,
          {
            id: 'post-list',
            type: 'feed',
            props: {
              items: [
                {
                  user: 'User1',
                  content: 'Check out this post!',
                  likes: 42,
                  comments: 12,
                },
                {
                  user: 'User2',
                  content: 'Another interesting post',
                  likes: 28,
                  comments: 5,
                },
              ],
            },
            position: { x: 0, y: 50 },
            order: 1,
          },
        ],
      });

      screens.push({
        name: 'Profile',
        components: [
          ...commonComponents,
          {
            id: 'profile-header',
            type: 'profile-header',
            props: {
              name: 'User Name',
              bio: 'App user',
              avatar: 'https://example.com/avatar.jpg',
              followers: 120,
              following: 80,
            },
            position: { x: 0, y: 50 },
            order: 1,
          },
          {
            id: 'user-posts',
            type: 'feed',
            props: {
              items: [
                {
                  content: 'My first post!',
                  likes: 15,
                  comments: 3,
                },
              ],
            },
            position: { x: 0, y: 200 },
            order: 2,
          },
        ],
      });
      break;

    case 'ecommerce':
      screens.push({
        name: 'Product List',
        components: [
          ...commonComponents,
          {
            id: 'product-grid',
            type: 'product-grid',
            props: {
              items: [
                {
                  name: 'Product 1',
                  price: '$19.99',
                  image: 'https://example.com/product1.jpg',
                },
                {
                  name: 'Product 2',
                  price: '$29.99',
                  image: 'https://example.com/product2.jpg',
                },
              ],
            },
            position: { x: 0, y: 50 },
            order: 1,
          },
        ],
      });

      screens.push({
        name: 'Product Detail',
        components: [
          ...commonComponents,
          {
            id: 'product-image',
            type: 'image',
            props: {
              source: 'https://example.com/product1.jpg',
              resizeMode: 'cover',
            },
            position: { x: 0, y: 50 },
            order: 1,
          },
          {
            id: 'product-info',
            type: 'product-info',
            props: {
              name: 'Product 1',
              price: '$19.99',
              description: 'This is a great product that solves your needs.',
              rating: 4.5,
            },
            position: { x: 0, y: 300 },
            order: 2,
          },
          {
            id: 'add-to-cart',
            type: 'button',
            props: {
              label: 'Add to Cart',
              variant: 'primary',
            },
            position: { x: 0, y: 500 },
            order: 3,
          },
        ],
      });

      screens.push({
        name: 'Cart',
        components: [
          ...commonComponents,
          {
            id: 'cart-items',
            type: 'cart-list',
            props: {
              items: [
                {
                  name: 'Product 1',
                  price: '$19.99',
                  quantity: 1,
                },
              ],
              subtotal: '$19.99',
              shipping: '$5.00',
              total: '$24.99',
            },
            position: { x: 0, y: 50 },
            order: 1,
          },
          {
            id: 'checkout',
            type: 'button',
            props: {
              label: 'Proceed to Checkout',
              variant: 'primary',
            },
            position: { x: 0, y: 400 },
            order: 2,
          },
        ],
      });
      break;

    case 'fitness':
      screens.push({
        name: 'Dashboard',
        components: [
          ...commonComponents,
          {
            id: 'stats',
            type: 'stats-grid',
            props: {
              items: [
                { label: 'Workouts', value: '12' },
                { label: 'Calories', value: '1,200' },
                { label: 'Weight', value: '180 lbs' },
              ],
            },
            position: { x: 0, y: 50 },
            order: 1,
          },
          {
            id: 'recent-workouts',
            type: 'list',
            props: {
              items: [
                { title: 'Morning Run', subtitle: '30 min' },
                { title: 'Weight Training', subtitle: '45 min' },
              ],
            },
            position: { x: 0, y: 200 },
            order: 2,
          },
        ],
      });

      screens.push({
        name: 'Workout Log',
        components: [
          ...commonComponents,
          {
            id: 'workout-form',
            type: 'form',
            props: {
              fields: [
                { label: 'Workout Type', type: 'select', options: ['Run', 'Walk', 'Swim', 'Cycle'] },
                { label: 'Duration', type: 'number', unit: 'minutes' },
                { label: 'Calories', type: 'number' },
                { label: 'Notes', type: 'text' },
              ],
            },
            position: { x: 0, y: 50 },
            order: 1,
          },
          {
            id: 'save-workout',
            type: 'button',
            props: {
              label: 'Save Workout',
              variant: 'primary',
            },
            position: { x: 0, y: 400 },
            order: 2,
          },
        ],
      });
      break;

    default: // utility or other app types
      screens.push({
        name: 'Home',
        components: [
          ...commonComponents,
          {
            id: 'welcome',
            type: 'text',
            props: {
              content: 'Welcome to your app!',
              variant: 'headline',
            },
            position: { x: 0, y: 50 },
            order: 1,
          },
          {
            id: 'main-action',
            type: 'button',
            props: {
              label: 'Get Started',
              variant: 'primary',
            },
            position: { x: 0, y: 150 },
            order: 2,
          },
        ],
      });

      screens.push({
        name: 'Settings',
        components: [
          ...commonComponents,
          {
            id: 'settings-list',
            type: 'list',
            props: {
              items: [
                { title: 'Account', icon: 'account' },
                { title: 'Notifications', icon: 'bell' },
                { title: 'Privacy', icon: 'lock' },
                { title: 'About', icon: 'information' },
              ],
            },
            position: { x: 0, y: 50 },
            order: 1,
          },
        ],
      });
  }

  // Add authentication screens if needed
  if (intent.keyFeatures.includes('login') || intent.keyFeatures.includes('signup')) {
    screens.push({
      name: 'Login',
      components: [
        {
          id: 'login-form',
          type: 'form',
          props: {
            fields: [
              { label: 'Email', type: 'email' },
              { label: 'Password', type: 'password' },
            ],
          },
          position: { x: 0, y: 50 },
          order: 1,
        },
        {
          id: 'login-button',
          type: 'button',
          props: {
            label: 'Login',
            variant: 'primary',
          },
          position: { x: 0, y: 250 },
          order: 2,
        },
        {
          id: 'forgot-password',
          type: 'button',
          props: {
            label: 'Forgot Password?',
            variant: 'text',
          },
          position: { x: 0, y: 300 },
          order: 3,
        },
      ],
    });

    screens.push({
      name: 'Signup',
      components: [
        {
          id: 'signup-form',
          type: 'form',
          props: {
            fields: [
              { label: 'Name', type: 'text' },
              { label: 'Email', type: 'email' },
              { label: 'Password', type: 'password' },
            ],
          },
          position: { x: 0, y: 50 },
          order: 1,
        },
        {
          id: 'signup-button',
          type: 'button',
          props: {
            label: 'Create Account',
            variant: 'primary',
          },
          position: { x: 0, y: 300 },
          order: 2,
        },
      ],
    });
  }

  return screens;
}
