import { Project } from '@/types/project';
import { Component } from '@/types/component';
import { Screen } from '@/types/screen';

interface SuggestedScreen {
  name: string;
  components: Component[];
}

interface IntentResult {
  appType: string;
  targetAudience: string;
  keyFeatures: string[];
  monetizationIdeas: string[];
  needsClarification: boolean;
  questions: string[];
}

export function suggestComponents(intent: IntentResult): SuggestedScreen[] {
  const screens: SuggestedScreen[] = [];

  // Common screens for all apps
  screens.push({
    name: 'Onboarding',
    components: [
      {
        id: 'comp_onboarding_1',
        screenId: '',
        type: 'carousel',
        props: {
          pages: [
            { title: 'Welcome', description: 'Get started with our app' },
            { title: 'Features', description: 'Discover what we offer' },
            { title: 'Ready', description: 'Let\'s begin!' }
          ]
        },
        position: { x: 0, y: 0 },
        order: 0
      },
      {
        id: 'comp_onboarding_2',
        screenId: '',
        type: 'button',
        props: {
          label: 'Get Started',
          variant: 'primary'
        },
        position: { x: 0, y: 400 },
        order: 1
      }
    ]
  });

  // App type specific screens
  switch (intent.appType) {
    case 'social':
      screens.push({
        name: 'Feed',
        components: [
          {
            id: 'comp_feed_1',
            screenId: '',
            type: 'feed',
            props: {
              itemType: 'post',
              showActions: true
            },
            position: { x: 0, y: 0 },
            order: 0
          },
          {
            id: 'comp_feed_2',
            screenId: '',
            type: 'fab',
            props: {
              icon: 'plus',
              position: 'bottom-right'
            },
            position: { x: 300, y: 500 },
            order: 1
          }
        ]
      });
      screens.push({
        name: 'Profile',
        components: [
          {
            id: 'comp_profile_1',
            screenId: '',
            type: 'avatar',
            props: {
              size: 'large',
              editable: true
            },
            position: { x: 150, y: 50 },
            order: 0
          },
          {
            id: 'comp_profile_2',
            screenId: '',
            type: 'text',
            props: {
              content: 'Username',
              variant: 'headline'
            },
            position: { x: 100, y: 150 },
            order: 1
          },
          {
            id: 'comp_profile_3',
            screenId: '',
            type: 'button',
            props: {
              label: 'Edit Profile',
              variant: 'outlined'
            },
            position: { x: 100, y: 200 },
            order: 2
          }
        ]
      });
      break;

    case 'ecommerce':
      screens.push({
        name: 'Product List',
        components: [
          {
            id: 'comp_products_1',
            screenId: '',
            type: 'grid',
            props: {
              columns: 2,
              itemType: 'product'
            },
            position: { x: 0, y: 0 },
            order: 0
          },
          {
            id: 'comp_products_2',
            screenId: '',
            type: 'search',
            props: {
              placeholder: 'Search products...'
            },
            position: { x: 0, y: 0 },
            order: 1
          }
        ]
      });
      screens.push({
        name: 'Product Detail',
        components: [
          {
            id: 'comp_detail_1',
            screenId: '',
            type: 'image',
            props: {
              source: 'product_image',
              aspectRatio: '1:1'
            },
            position: { x: 0, y: 0 },
            order: 0
          },
          {
            id: 'comp_detail_2',
            screenId: '',
            type: 'text',
            props: {
              content: 'Product Name',
              variant: 'headline'
            },
            position: { x: 0, y: 300 },
            order: 1
          },
          {
            id: 'comp_detail_3',
            screenId: '',
            type: 'button',
            props: {
              label: 'Add to Cart',
              variant: 'primary'
            },
            position: { x: 0, y: 400 },
            order: 2
          }
        ]
      });
      break;

    case 'fitness':
      screens.push({
        name: 'Workout List',
        components: [
          {
            id: 'comp_workouts_1',
            screenId: '',
            type: 'list',
            props: {
              itemType: 'workout',
              showDuration: true
            },
            position: { x: 0, y: 0 },
            order: 0
          },
          {
            id: 'comp_workouts_2',
            screenId: '',
            type: 'fab',
            props: {
              icon: 'plus',
              position: 'bottom-right'
            },
            position: { x: 300, y: 500 },
            order: 1
          }
        ]
      });
      screens.push({
        name: 'Progress',
        components: [
          {
            id: 'comp_progress_1',
            screenId: '',
            type: 'chart',
            props: {
              type: 'line',
              data: 'workout_history'
            },
            position: { x: 0, y: 0 },
            order: 0
          },
          {
            id: 'comp_progress_2',
            screenId: '',
            type: 'stats',
            props: {
              metrics: ['calories', 'duration', 'workouts']
            },
            position: { x: 0, y: 300 },
            order: 1
          }
        ]
      });
      break;

    default: // utility or other types
      screens.push({
        name: 'Main',
        components: [
          {
            id: 'comp_main_1',
            screenId: '',
            type: 'text',
            props: {
              content: 'Welcome to your app!',
              variant: 'headline'
            },
            position: { x: 50, y: 100 },
            order: 0
          },
          {
            id: 'comp_main_2',
            screenId: '',
            type: 'button',
            props: {
              label: 'Get Started',
              variant: 'primary'
            },
            position: { x: 100, y: 200 },
            order: 1
          }
        ]
      });
  }

  // Add authentication screens if needed
  if (intent.keyFeatures.includes('authentication')) {
    screens.push({
      name: 'Login',
      components: [
        {
          id: 'comp_login_1',
          screenId: '',
          type: 'input',
          props: {
            label: 'Email',
            placeholder: 'Enter your email',
            keyboardType: 'email-address'
          },
          position: { x: 50, y: 100 },
          order: 0
        },
        {
          id: 'comp_login_2',
          screenId: '',
          type: 'input',
          props: {
            label: 'Password',
            placeholder: 'Enter your password',
            secureTextEntry: true
          },
          position: { x: 50, y: 180 },
          order: 1
        },
        {
          id: 'comp_login_3',
          screenId: '',
          type: 'button',
          props: {
            label: 'Login',
            variant: 'primary'
          },
          position: { x: 50, y: 260 },
          order: 2
        },
        {
          id: 'comp_login_4',
          screenId: '',
          type: 'text',
          props: {
            content: 'Forgot password?',
            variant: 'body',
            color: 'primary'
          },
          position: { x: 50, y: 320 },
          order: 3
        }
      ]
    });
  }

  // Add payment screens if needed
  if (intent.keyFeatures.includes('payments')) {
    screens.push({
      name: 'Checkout',
      components: [
        {
          id: 'comp_checkout_1',
          screenId: '',
          type: 'card',
          props: {
            title: 'Payment Information',
            content: 'Enter your payment details'
          },
          position: { x: 0, y: 0 },
          order: 0
        },
        {
          id: 'comp_checkout_2',
          screenId: '',
          type: 'input',
          props: {
            label: 'Card Number',
            placeholder: '1234 5678 9012 3456',
            keyboardType: 'numeric'
          },
          position: { x: 20, y: 80 },
          order: 1
        },
        {
          id: 'comp_checkout_3',
          screenId: '',
          type: 'button',
          props: {
            label: 'Complete Payment',
            variant: 'primary'
          },
          position: { x: 20, y: 200 },
          order: 2
        }
      ]
    });
  }

  return screens;
}
