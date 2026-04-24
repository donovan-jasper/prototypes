import { IntentResult } from './intentParser';

interface SuggestedComponent {
  type: string;
  props: Record<string, any>;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface SuggestedScreen {
  name: string;
  components: SuggestedComponent[];
}

export function suggestComponents(intent: IntentResult): SuggestedScreen[] {
  const screens: SuggestedScreen[] = [];

  // Common screens for all apps
  screens.push({
    name: 'Onboarding',
    components: [
      {
        type: 'header',
        props: {
          title: 'Welcome',
          subtitle: 'Get started with our app',
          textAlign: 'center'
        },
        position: { x: 0, y: 0, width: '100%', height: 'auto' }
      },
      {
        type: 'image',
        props: {
          source: 'https://example.com/onboarding-image.jpg',
          resizeMode: 'contain',
          height: 200
        },
        position: { x: 0, y: 80, width: '100%', height: 200 }
      },
      {
        type: 'button',
        props: {
          label: 'Get Started',
          variant: 'primary',
          size: 'large'
        },
        position: { x: 20, y: 300, width: '90%', height: 50 }
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
            type: 'header',
            props: {
              title: 'Feed',
              showBackButton: false
            },
            position: { x: 0, y: 0, width: '100%', height: 'auto' }
          },
          {
            type: 'feed',
            props: {
              itemType: 'post',
              showAvatars: true,
              showActions: true
            },
            position: { x: 0, y: 60, width: '100%', height: 'calc(100% - 120px)' }
          },
          {
            type: 'fab',
            props: {
              icon: 'plus',
              position: 'bottom-right',
              color: 'primary'
            },
            position: { x: 'auto', y: 'auto', width: 56, height: 56 }
          }
        ]
      });

      screens.push({
        name: 'Profile',
        components: [
          {
            type: 'header',
            props: {
              title: 'Profile',
              showBackButton: true
            },
            position: { x: 0, y: 0, width: '100%', height: 'auto' }
          },
          {
            type: 'profile-header',
            props: {
              showEditButton: true
            },
            position: { x: 0, y: 60, width: '100%', height: 'auto' }
          },
          {
            type: 'tab-bar',
            props: {
              tabs: ['Posts', 'About', 'Photos'],
              initialTab: 'Posts'
            },
            position: { x: 0, y: 200, width: '100%', height: 'auto' }
          }
        ]
      });
      break;

    case 'ecommerce':
      screens.push({
        name: 'Product List',
        components: [
          {
            type: 'header',
            props: {
              title: 'Shop',
              showSearch: true
            },
            position: { x: 0, y: 0, width: '100%', height: 'auto' }
          },
          {
            type: 'product-grid',
            props: {
              columns: 2,
              showPrice: true,
              showAddToCart: true
            },
            position: { x: 0, y: 60, width: '100%', height: 'calc(100% - 120px)' }
          },
          {
            type: 'filter-button',
            props: {
              position: 'top-right'
            },
            position: { x: 'auto', y: 10, width: 40, height: 40 }
          }
        ]
      });

      screens.push({
        name: 'Product Detail',
        components: [
          {
            type: 'header',
            props: {
              title: 'Product',
              showBackButton: true
            },
            position: { x: 0, y: 0, width: '100%', height: 'auto' }
          },
          {
            type: 'product-image',
            props: {
              height: 300
            },
            position: { x: 0, y: 60, width: '100%', height: 300 }
          },
          {
            type: 'product-info',
            props: {
              showPrice: true,
              showDescription: true
            },
            position: { x: 0, y: 360, width: '100%', height: 'auto' }
          },
          {
            type: 'button',
            props: {
              label: 'Add to Cart',
              variant: 'primary',
              size: 'large'
            },
            position: { x: 20, y: 450, width: '90%', height: 50 }
          }
        ]
      });

      screens.push({
        name: 'Cart',
        components: [
          {
            type: 'header',
            props: {
              title: 'Cart',
              showBackButton: true
            },
            position: { x: 0, y: 0, width: '100%', height: 'auto' }
          },
          {
            type: 'cart-items',
            props: {
              showRemoveButton: true
            },
            position: { x: 0, y: 60, width: '100%', height: 'calc(100% - 200px)' }
          },
          {
            type: 'cart-summary',
            props: {
              showTotal: true,
              showTax: true
            },
            position: { x: 0, y: 'auto', width: '100%', height: 100 }
          },
          {
            type: 'button',
            props: {
              label: 'Checkout',
              variant: 'primary',
              size: 'large'
            },
            position: { x: 20, y: 'auto', width: '90%', height: 50 }
          }
        ]
      });
      break;

    case 'fitness':
      screens.push({
        name: 'Dashboard',
        components: [
          {
            type: 'header',
            props: {
              title: 'Dashboard',
              showBackButton: false
            },
            position: { x: 0, y: 0, width: '100%', height: 'auto' }
          },
          {
            type: 'stats-grid',
            props: {
              items: [
                { label: 'Workouts', value: '0' },
                { label: 'Calories', value: '0' },
                { label: 'Minutes', value: '0' }
              ]
            },
            position: { x: 0, y: 60, width: '100%', height: 120 }
          },
          {
            type: 'progress-chart',
            props: {
              type: 'weekly',
              height: 200
            },
            position: { x: 0, y: 180, width: '100%', height: 200 }
          },
          {
            type: 'button',
            props: {
              label: 'Start Workout',
              variant: 'primary',
              size: 'large'
            },
            position: { x: 20, y: 400, width: '90%', height: 50 }
          }
        ]
      });

      screens.push({
        name: 'Workout',
        components: [
          {
            type: 'header',
            props: {
              title: 'Workout',
              showBackButton: true
            },
            position: { x: 0, y: 0, width: '100%', height: 'auto' }
          },
          {
            type: 'workout-timer',
            props: {
              initialTime: 30
            },
            position: { x: 0, y: 60, width: '100%', height: 100 }
          },
          {
            type: 'exercise-list',
            props: {
              showReps: true,
              showTimer: true
            },
            position: { x: 0, y: 160, width: '100%', height: 'calc(100% - 220px)' }
          },
          {
            type: 'button',
            props: {
              label: 'Finish Workout',
              variant: 'primary',
              size: 'large'
            },
            position: { x: 20, y: 'auto', width: '90%', height: 50 }
          }
        ]
      });
      break;

    default:
      // Default screens for utility apps
      screens.push({
        name: 'Home',
        components: [
          {
            type: 'header',
            props: {
              title: 'Home',
              showBackButton: false
            },
            position: { x: 0, y: 0, width: '100%', height: 'auto' }
          },
          {
            type: 'main-content',
            props: {
              content: 'Welcome to your app!'
            },
            position: { x: 0, y: 60, width: '100%', height: 'calc(100% - 120px)' }
          },
          {
            type: 'button',
            props: {
              label: 'Get Started',
              variant: 'primary',
              size: 'large'
            },
            position: { x: 20, y: 'auto', width: '90%', height: 50 }
          }
        ]
      });

      screens.push({
        name: 'Main Feature',
        components: [
          {
            type: 'header',
            props: {
              title: 'Main Feature',
              showBackButton: true
            },
            position: { x: 0, y: 0, width: '100%', height: 'auto' }
          },
          {
            type: 'feature-content',
            props: {
              content: 'This is where the main functionality of your app will be.'
            },
            position: { x: 0, y: 60, width: '100%', height: 'calc(100% - 120px)' }
          },
          {
            type: 'button',
            props: {
              label: 'Action',
              variant: 'primary',
              size: 'large'
            },
            position: { x: 20, y: 'auto', width: '90%', height: 50 }
          }
        ]
      });
  }

  // Add common screens for all apps
  screens.push({
    name: 'Login',
    components: [
      {
        type: 'header',
        props: {
          title: 'Login',
          showBackButton: true
        },
        position: { x: 0, y: 0, width: '100%', height: 'auto' }
      },
      {
        type: 'input',
        props: {
          label: 'Email',
          placeholder: 'Enter your email',
          keyboardType: 'email-address',
          autoCapitalize: 'none'
        },
        position: { x: 20, y: 80, width: '90%', height: 60 }
      },
      {
        type: 'input',
        props: {
          label: 'Password',
          placeholder: 'Enter your password',
          secureTextEntry: true
        },
        position: { x: 20, y: 150, width: '90%', height: 60 }
      },
      {
        type: 'button',
        props: {
          label: 'Login',
          variant: 'primary',
          size: 'large'
        },
        position: { x: 20, y: 240, width: '90%', height: 50 }
      },
      {
        type: 'text',
        props: {
          content: 'Forgot password?',
          textAlign: 'center',
          color: 'primary'
        },
        position: { x: 0, y: 310, width: '100%', height: 'auto' }
      }
    ]
  });

  screens.push({
    name: 'Settings',
    components: [
      {
        type: 'header',
        props: {
          title: 'Settings',
          showBackButton: true
        },
        position: { x: 0, y: 0, width: '100%', height: 'auto' }
      },
      {
        type: 'settings-list',
        props: {
          items: [
            { label: 'Account', icon: 'account' },
            { label: 'Notifications', icon: 'bell' },
            { label: 'Privacy', icon: 'lock' },
            { label: 'Help', icon: 'help' }
          ]
        },
        position: { x: 0, y: 60, width: '100%', height: 'calc(100% - 60px)' }
      }
    ]
  });

  return screens;
}
