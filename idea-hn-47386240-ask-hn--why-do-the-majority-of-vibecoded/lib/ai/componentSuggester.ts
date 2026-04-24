import type { Project } from '@/types/project';

interface SuggestedComponent {
  type: string;
  props: Record<string, any>;
  position: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
}

interface SuggestedScreen {
  name: string;
  components: SuggestedComponent[];
}

export function suggestComponents(project: Partial<Project>): SuggestedScreen[] {
  // In a real implementation, this would call the OpenAI API
  // For this prototype, we'll use rule-based suggestions based on app type

  const baseComponents: SuggestedComponent[] = [
    {
      type: 'header',
      props: {
        title: project.name || 'My App',
        showBackButton: false,
      },
      position: { x: 0, y: 0, width: '100%', height: 60 },
    },
    {
      type: 'footer',
      props: {
        items: [
          { label: 'Home', icon: 'home' },
          { label: 'Profile', icon: 'account' },
        ],
      },
      position: { x: 0, y: 'auto', width: '100%', height: 60 },
    },
  ];

  // App type specific screens and components
  const appTypeScreens: Record<string, SuggestedScreen[]> = {
    social: [
      {
        name: 'Feed',
        components: [
          ...baseComponents,
          {
            type: 'feed',
            props: {
              itemType: 'post',
              showActions: true,
            },
            position: { x: 0, y: 60, width: '100%', height: 'auto' },
          },
          {
            type: 'fab',
            props: {
              icon: 'plus',
              onPress: 'navigateToCreatePost',
            },
            position: { x: 'auto', y: 'auto', width: 56, height: 56 },
          },
        ],
      },
      {
        name: 'Profile',
        components: [
          ...baseComponents,
          {
            type: 'profile_header',
            props: {
              showEditButton: true,
            },
            position: { x: 0, y: 60, width: '100%', height: 150 },
          },
          {
            type: 'tab_view',
            props: {
              tabs: ['Posts', 'Photos', 'About'],
            },
            position: { x: 0, y: 210, width: '100%', height: 'auto' },
          },
        ],
      },
    ],
    ecommerce: [
      {
        name: 'Product List',
        components: [
          ...baseComponents,
          {
            type: 'search_bar',
            props: {
              placeholder: 'Search products...',
            },
            position: { x: 0, y: 60, width: '100%', height: 50 },
          },
          {
            type: 'product_grid',
            props: {
              columns: 2,
              showPrice: true,
            },
            position: { x: 0, y: 110, width: '100%', height: 'auto' },
          },
        ],
      },
      {
        name: 'Product Detail',
        components: [
          ...baseComponents,
          {
            type: 'product_image',
            props: {
              showZoom: true,
            },
            position: { x: 0, y: 60, width: '100%', height: 300 },
          },
          {
            type: 'product_info',
            props: {
              showDescription: true,
              showPrice: true,
            },
            position: { x: 0, y: 360, width: '100%', height: 'auto' },
          },
          {
            type: 'button',
            props: {
              label: 'Add to Cart',
              variant: 'primary',
            },
            position: { x: 16, y: 'auto', width: 'calc(100% - 32px)', height: 50 },
          },
        ],
      },
      {
        name: 'Cart',
        components: [
          ...baseComponents,
          {
            type: 'cart_items',
            props: {
              showRemoveButton: true,
            },
            position: { x: 0, y: 60, width: '100%', height: 'auto' },
          },
          {
            type: 'cart_summary',
            props: {
              showTax: true,
              showTotal: true,
            },
            position: { x: 0, y: 'auto', width: '100%', height: 100 },
          },
          {
            type: 'button',
            props: {
              label: 'Checkout',
              variant: 'primary',
            },
            position: { x: 16, y: 'auto', width: 'calc(100% - 32px)', height: 50 },
          },
        ],
      },
    ],
    fitness: [
      {
        name: 'Dashboard',
        components: [
          ...baseComponents,
          {
            type: 'stats_cards',
            props: {
              stats: [
                { label: 'Workouts', value: '0' },
                { label: 'Calories', value: '0' },
                { label: 'Minutes', value: '0' },
              ],
            },
            position: { x: 0, y: 60, width: '100%', height: 120 },
          },
          {
            type: 'workout_list',
            props: {
              showAddButton: true,
            },
            position: { x: 0, y: 180, width: '100%', height: 'auto' },
          },
        ],
      },
      {
        name: 'Workout Detail',
        components: [
          ...baseComponents,
          {
            type: 'workout_header',
            props: {
              showTimer: true,
            },
            position: { x: 0, y: 60, width: '100%', height: 150 },
          },
          {
            type: 'exercise_list',
            props: {
              showReps: true,
              showWeight: true,
            },
            position: { x: 0, y: 210, width: '100%', height: 'auto' },
          },
          {
            type: 'button',
            props: {
              label: 'Start Workout',
              variant: 'primary',
            },
            position: { x: 16, y: 'auto', width: 'calc(100% - 32px)', height: 50 },
          },
        ],
      },
    ],
  };

  // Default screens if no specific app type matches
  const defaultScreens: SuggestedScreen[] = [
    {
      name: 'Home',
      components: [
        ...baseComponents,
        {
          type: 'hero',
          props: {
            title: 'Welcome to your app',
            subtitle: 'Get started with these features',
          },
          position: { x: 0, y: 60, width: '100%', height: 200 },
        },
        {
          type: 'feature_grid',
          props: {
            features: [
              { icon: 'star', label: 'Feature 1' },
              { icon: 'heart', label: 'Feature 2' },
              { icon: 'rocket', label: 'Feature 3' },
            ],
          },
          position: { x: 0, y: 260, width: '100%', height: 'auto' },
        },
      ],
    },
    {
      name: 'Settings',
      components: [
        ...baseComponents,
        {
          type: 'settings_list',
          props: {
            items: [
              { label: 'Account', icon: 'account' },
              { label: 'Notifications', icon: 'bell' },
              { label: 'Privacy', icon: 'lock' },
            ],
          },
          position: { x: 0, y: 60, width: '100%', height: 'auto' },
        },
      ],
    },
  ];

  // Return screens based on app type or default
  return project.appType && appTypeScreens[project.appType]
    ? appTypeScreens[project.appType]
    : defaultScreens;
}
