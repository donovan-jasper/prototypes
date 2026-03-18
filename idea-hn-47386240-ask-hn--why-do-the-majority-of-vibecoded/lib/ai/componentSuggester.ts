import { IntentResult } from './intentParser';
import type { Component } from '@/types/project';

export interface SuggestedComponent {
  type: string;
  props: object;
  position: object; // For future use, e.g., { x: 0, y: 0, width: '100%', height: 'auto' }
  order: number;
}

export interface SuggestedScreen {
  name: string;
  components: SuggestedComponent[];
}

/**
 * Mocks the AI component suggestion.
 * In a real scenario, this would use the parsed intent to generate
 * a list of relevant screens and components, potentially using a
 * more advanced AI model or a rule-based system with a large component library.
 */
export function suggestComponents(intent: IntentResult): SuggestedScreen[] {
  const screens: SuggestedScreen[] = [];
  const commonComponents: SuggestedComponent[] = [
    { type: 'header', props: { title: 'App Name' }, position: {}, order: 0 },
  ];

  // Add authentication screens if 'authentication' feature is present
  if (intent.features.includes('authentication')) {
    screens.push({
      name: 'Login',
      components: [
        { type: 'header', props: { title: 'Welcome Back!' }, position: {}, order: 0 },
        { type: 'input', props: { label: 'Email', keyboardType: 'email-address' }, position: {}, order: 1 },
        { type: 'input', props: { label: 'Password', secureTextEntry: true }, position: {}, order: 2 },
        { type: 'button', props: { label: 'Login', variant: 'primary' }, position: {}, order: 3 },
        { type: 'text', props: { content: 'Forgot Password?' }, position: {}, order: 4 },
        { type: 'button', props: { label: 'Sign Up', variant: 'text' }, position: {}, order: 5 },
      ],
    });
    screens.push({
      name: 'Sign Up',
      components: [
        { type: 'header', props: { title: 'Join ProtoPulse' }, position: {}, order: 0 },
        { type: 'input', props: { label: 'Name' }, position: {}, order: 1 },
        { type: 'input', props: { label: 'Email', keyboardType: 'email-address' }, position: {}, order: 2 },
        { type: 'input', props: { label: 'Password', secureTextEntry: true }, position: {}, order: 3 },
        { type: 'button', props: { label: 'Create Account', variant: 'primary' }, position: {}, order: 4 },
        { type: 'text', props: { content: 'Already have an account? Login' }, position: {}, order: 5 },
      ],
    });
  }

  // Suggest screens and components based on app type and features
  switch (intent.appType) {
    case 'social':
      screens.push({
        name: 'Feed',
        components: [
          ...commonComponents,
          { type: 'header', props: { title: 'Feed', rightIcon: 'plus' }, position: {}, order: 0 },
          { type: 'card', props: { title: 'User Post', content: 'This is an example post from a friend!' }, position: {}, order: 1 },
          { type: 'card', props: { title: 'Another Post', content: 'Check out this cool thing I found.' }, position: {}, order: 2 },
          { type: 'tab_bar', props: { items: ['Feed', 'Search', 'Profile'] }, position: {}, order: 3 },
        ],
      });
      screens.push({
        name: 'Profile',
        components: [
          ...commonComponents,
          { type: 'header', props: { title: 'My Profile', rightIcon: 'cog' }, position: {}, order: 0 },
          { type: 'image', props: { source: 'https://via.placeholder.com/150', style: { width: 100, height: 100, borderRadius: 50 } }, position: {}, order: 1 },
          { type: 'text', props: { content: 'John Doe', variant: 'headlineSmall' }, position: {}, order: 2 },
          { type: 'text', props: { content: '@johndoe', variant: 'bodyMedium' }, position: {}, order: 3 },
          { type: 'button', props: { label: 'Edit Profile', variant: 'outlined' }, position: {}, order: 4 },
          { type: 'list', props: { items: ['My Posts', 'Followers', 'Following'] }, position: {}, order: 5 },
          { type: 'tab_bar', props: { items: ['Feed', 'Search', 'Profile'] }, position: {}, order: 6 },
        ],
      });
      break;

    case 'fitness':
      screens.push({
        name: 'Dashboard',
        components: [
          ...commonComponents,
          { type: 'header', props: { title: 'Fitness Dashboard' }, position: {}, order: 0 },
          { type: 'card', props: { title: 'Today\'s Workout', content: 'Leg Day - 3 exercises remaining' }, position: {}, order: 1 },
          { type: 'card', props: { title: 'Weekly Progress', content: 'You\'ve logged 4 workouts this week!' }, position: {}, order: 2 },
          { type: 'button', props: { label: 'Log New Workout', variant: 'primary' }, position: {}, order: 3 },
          { type: 'tab_bar', props: { items: ['Dashboard', 'Workouts', 'Progress'] }, position: {}, order: 4 },
        ],
      });
      screens.push({
        name: 'Log Workout',
        components: [
          ...commonComponents,
          { type: 'header', props: { title: 'Log Workout' }, position: {}, order: 0 },
          { type: 'input', props: { label: 'Workout Name' }, position: {}, order: 1 },
          { type: 'input', props: { label: 'Duration (minutes)', keyboardType: 'numeric' }, position: {}, order: 2 },
          { type: 'list', props: { items: ['Add Exercise', 'Add Exercise'] }, position: {}, order: 3 }, // Placeholder for dynamic list
          { type: 'button', props: { label: 'Save Workout', variant: 'primary' }, position: {}, order: 4 },
        ],
      });
      break;

    case 'ecommerce':
      screens.push({
        name: 'Products',
        components: [
          ...commonComponents,
          { type: 'header', props: { title: 'Shop', rightIcon: 'cart' }, position: {}, order: 0 },
          { type: 'input', props: { label: 'Search products', leftIcon: 'magnify' }, position: {}, order: 1 },
          { type: 'card', props: { title: 'Product 1', content: '$19.99 - A great item!', image: 'https://via.placeholder.com/100' }, position: {}, order: 2 },
          { type: 'card', props: { title: 'Product 2', content: '$29.99 - Another must-have!', image: 'https://via.placeholder.com/100' }, position: {}, order: 3 },
          { type: 'tab_bar', props: { items: ['Home', 'Categories', 'Cart', 'Account'] }, position: {}, order: 4 },
        ],
      });
      screens.push({
        name: 'Product Detail',
        components: [
          ...commonComponents,
          { type: 'header', props: { title: 'Product Detail' }, position: {}, order: 0 },
          { type: 'image', props: { source: 'https://via.placeholder.com/200', style: { width: '100%', height: 200 } }, position: {}, order: 1 },
          { type: 'text', props: { content: 'Awesome Gadget', variant: 'headlineSmall' }, position: {}, order: 2 },
          { type: 'text', props: { content: '$49.99', variant: 'titleLarge' }, position: {}, order: 3 },
          { type: 'text', props: { content: 'This is a detailed description of the awesome gadget. It has many features and benefits.', variant: 'bodyMedium' }, position: {}, order: 4 },
          { type: 'button', props: { label: 'Add to Cart', variant: 'primary' }, position: {}, order: 5 },
        ],
      });
      screens.push({
        name: 'Cart',
        components: [
          ...commonComponents,
          { type: 'header', props: { title: 'Your Cart' }, position: {}, order: 0 },
          { type: 'list', props: { items: ['Item 1 ($19.99)', 'Item 2 ($29.99)'] }, position: {}, order: 1 },
          { type: 'text', props: { content: 'Total: $49.98', variant: 'titleMedium' }, position: {}, order: 2 },
          { type: 'button', props: { label: 'Proceed to Checkout', variant: 'primary' }, position: {}, order: 3 },
        ],
      });
      break;

    case 'productivity':
      screens.push({
        name: 'Tasks',
        components: [
          ...commonComponents,
          { type: 'header', props: { title: 'My Tasks', rightIcon: 'plus' }, position: {}, order: 0 },
          { type: 'card', props: { title: 'Complete Project Report', content: 'Due: Tomorrow' }, position: {}, order: 1 },
          { type: 'card', props: { title: 'Schedule Team Meeting', content: 'Priority: High' }, position: {}, order: 2 },
          { type: 'tab_bar', props: { items: ['Tasks', 'Projects', 'Settings'] }, position: {}, order: 3 },
        ],
      });
      break;

    case 'content':
      screens.push({
        name: 'Articles',
        components: [
          ...commonComponents,
          { type: 'header', props: { title: 'Latest Articles' }, position: {}, order: 0 },
          { type: 'card', props: { title: 'Article Title 1', content: 'A summary of the first article.' }, position: {}, order: 1 },
          { type: 'card', props: { title: 'Article Title 2', content: 'Another interesting read.' }, position: {}, order: 2 },
          { type: 'tab_bar', props: { items: ['Home', 'Categories', 'Saved'] }, position: {}, order: 3 },
        ],
      });
      break;

    case 'food':
      screens.push({
        name: 'Recipes',
        components: [
          ...commonComponents,
          { type: 'header', props: { title: 'Recipes', rightIcon: 'magnify' }, position: {}, order: 0 },
          { type: 'card', props: { title: 'Spaghetti Carbonara', content: 'Classic Italian dish.' }, position: {}, order: 1 },
          { type: 'card', props: { title: 'Chicken Stir-fry', content: 'Quick and healthy meal.' }, position: {}, order: 2 },
          { type: 'tab_bar', props: { items: ['Recipes', 'Meal Plan', 'Shopping List'] }, position: {}, order: 3 },
        ],
      });
      break;

    default: // General app
      screens.push({
        name: 'Home',
        components: [
          ...commonComponents,
          { type: 'header', props: { title: 'My New App' }, position: {}, order: 0 },
          { type: 'text', props: { content: 'Welcome to your prototype!', variant: 'headlineSmall' }, position: {}, order: 1 },
          { type: 'button', props: { label: 'Get Started', variant: 'primary' }, position: {}, order: 2 },
          { type: 'text', props: { content: 'This is a basic screen generated from your description.', variant: 'bodyMedium' }, position: {}, order: 3 },
        ],
      });
      break;
  }

  // Ensure at least one screen exists if no specific type matched
  if (screens.length === 0) {
    screens.push({
      name: 'Home',
      components: [
        ...commonComponents,
        { type: 'header', props: { title: 'My New App' }, position: {}, order: 0 },
        { type: 'text', props: { content: 'Welcome to your prototype!', variant: 'headlineSmall' }, position: {}, order: 1 },
        { type: 'button', props: { label: 'Get Started', variant: 'primary' }, position: {}, order: 2 },
        { type: 'text', props: { content: 'This is a basic screen generated from your description.', variant: 'bodyMedium' }, position: {}, order: 3 },
      ],
    });
  }

  return screens;
}
