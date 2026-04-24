import { ComponentTemplate } from '@/types/component';
import { useComponentTemplates } from '@/lib/templates/componentTemplates';

interface SuggestedScreen {
  name: string;
  components: ComponentTemplate[];
}

interface IntentResult {
  appType: string;
  targetAudience: string[];
  keyFeatures: string[];
  monetizationIdeas: string[];
}

export function suggestComponents(intent: IntentResult): SuggestedScreen[] {
  const templates = useComponentTemplates();
  const screens: SuggestedScreen[] = [];

  // Common screens for all apps
  screens.push({
    name: 'Home',
    components: [
      templates.find(t => t.type === 'header')!,
      templates.find(t => t.type === 'text')!,
      templates.find(t => t.type === 'button')!,
    ],
  });

  // App type specific screens
  switch (intent.appType) {
    case 'social':
      screens.push({
        name: 'Feed',
        components: [
          templates.find(t => t.type === 'header')!,
          templates.find(t => t.type === 'feed')!,
        ],
      });
      screens.push({
        name: 'Profile',
        components: [
          templates.find(t => t.type === 'header')!,
          templates.find(t => t.type === 'card')!,
          templates.find(t => t.type === 'button')!,
        ],
      });
      break;

    case 'ecommerce':
      screens.push({
        name: 'Product List',
        components: [
          templates.find(t => t.type === 'header')!,
          templates.find(t => t.type === 'card')!,
          templates.find(t => t.type === 'input')!,
        ],
      });
      screens.push({
        name: 'Checkout',
        components: [
          templates.find(t => t.type === 'header')!,
          templates.find(t => t.type === 'input')!,
          templates.find(t => t.type === 'button')!,
        ],
      });
      break;

    case 'fitness':
      screens.push({
        name: 'Workout Log',
        components: [
          templates.find(t => t.type === 'header')!,
          templates.find(t => t.type === 'card')!,
          templates.find(t => t.type === 'button')!,
        ],
      });
      screens.push({
        name: 'Progress',
        components: [
          templates.find(t => t.type === 'header')!,
          templates.find(t => t.type === 'text')!,
          templates.find(t => t.type === 'image')!,
        ],
      });
      break;

    default:
      // Default screens for utility apps
      screens.push({
        name: 'Main',
        components: [
          templates.find(t => t.type === 'header')!,
          templates.find(t => t.type === 'text')!,
          templates.find(t => t.type === 'button')!,
        ],
      });
      screens.push({
        name: 'Settings',
        components: [
          templates.find(t => t.type === 'header')!,
          templates.find(t => t.type === 'input')!,
          templates.find(t => t.type === 'button')!,
        ],
      });
  }

  // Add authentication screens if login/signup is mentioned
  if (intent.keyFeatures.includes('login') || intent.keyFeatures.includes('signup')) {
    screens.push({
      name: 'Login',
      components: [
        templates.find(t => t.type === 'header')!,
        templates.find(t => t.type === 'input')!,
        templates.find(t => t.type === 'button')!,
      ],
    });
    screens.push({
      name: 'Signup',
      components: [
        templates.find(t => t.type === 'header')!,
        templates.find(t => t.type === 'input')!,
        templates.find(t => t.type === 'button')!,
      ],
    });
  }

  return screens;
}
