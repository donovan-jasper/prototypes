export interface DemoTemplate {
  id: string;
  keywords: string[];
  title: string;
  slides: string[];
}

export const demoTemplates: DemoTemplate[] = [
  {
    id: 'pitch-deck',
    keywords: ['pitch', 'startup', 'business', 'investor', 'funding', 'company', 'venture'],
    title: 'Startup Pitch Deck',
    slides: [
      '<h1>CoffeeFlow</h1><p>Revolutionizing the coffee shop experience</p>',
      '<h2>The Problem</h2><ul><li>Long wait times during rush hours</li><li>Inconsistent drink quality</li><li>Limited personalization options</li></ul>',
      '<h2>Our Solution</h2><p>AI-powered ordering system that learns your preferences and optimizes barista workflow</p>',
      '<h2>Market Opportunity</h2><ul><li>$45B coffee shop market</li><li>Growing demand for personalization</li><li>Tech-savvy millennial consumers</li></ul>',
      '<h2>Business Model</h2><p><strong>$2.99/month</strong> subscription per customer<br/>Revenue share with partner cafes</p>',
      '<h2>The Ask</h2><p>Seeking <strong>$2M seed round</strong> to scale to 100 locations</p>',
    ],
  },
  {
    id: 'lesson-plan',
    keywords: ['lesson', 'teach', 'education', 'class', 'student', 'learn', 'school', 'course'],
    title: 'Introduction to Photosynthesis',
    slides: [
      '<h1>Photosynthesis</h1><p>How plants make their own food</p>',
      '<h2>What is Photosynthesis?</h2><p>The process by which plants convert <strong>sunlight</strong> into <strong>energy</strong></p>',
      '<h2>Key Ingredients</h2><ul><li>Sunlight (energy source)</li><li>Water (H₂O)</li><li>Carbon dioxide (CO₂)</li><li>Chlorophyll (green pigment)</li></ul>',
      '<h2>The Chemical Equation</h2><p>6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂</p><p><em>Carbon dioxide + Water + Light → Glucose + Oxygen</em></p>',
      '<h2>Why It Matters</h2><ul><li>Produces oxygen we breathe</li><li>Foundation of food chain</li><li>Removes CO₂ from atmosphere</li></ul>',
      '<h2>Review Questions</h2><p>1. What are the three main ingredients?<br/>2. What does photosynthesis produce?<br/>3. Where does it happen in the plant?</p>',
    ],
  },
  {
    id: 'product-demo',
    keywords: ['product', 'demo', 'feature', 'app', 'software', 'tool', 'platform', 'showcase'],
    title: 'TaskMaster Pro Demo',
    slides: [
      '<h1>TaskMaster Pro</h1><p>Your intelligent task management companion</p>',
      '<h2>Smart Task Prioritization</h2><p>AI automatically ranks tasks by <strong>urgency</strong> and <strong>importance</strong></p>',
      '<h2>Key Features</h2><ul><li>Natural language input</li><li>Calendar integration</li><li>Team collaboration</li><li>Progress tracking</li></ul>',
      '<h2>Time Blocking</h2><p>Automatically schedules tasks into your calendar based on estimated duration and deadlines</p>',
      '<h2>Analytics Dashboard</h2><ul><li>Productivity trends</li><li>Time spent per project</li><li>Completion rates</li></ul>',
      '<h2>Get Started Today</h2><p>Free 14-day trial<br/><strong>No credit card required</strong></p>',
    ],
  },
  {
    id: 'quarterly-review',
    keywords: ['quarterly', 'review', 'report', 'results', 'performance', 'metrics', 'kpi', 'business'],
    title: 'Q1 2024 Business Review',
    slides: [
      '<h1>Q1 2024 Review</h1><p>Key achievements and insights</p>',
      '<h2>Revenue Growth</h2><p><strong>$2.4M</strong> total revenue<br/>32% increase from Q4 2023</p>',
      '<h2>Customer Metrics</h2><ul><li>1,250 new customers acquired</li><li>94% retention rate</li><li>Net Promoter Score: 68</li></ul>',
      '<h2>Product Milestones</h2><ul><li>Launched mobile app (iOS & Android)</li><li>Released API v2.0</li><li>Added 15 new integrations</li></ul>',
      '<h2>Team Growth</h2><p>Hired <strong>12 new team members</strong><br/>Engineering, Sales, and Customer Success</p>',
      '<h2>Q2 Priorities</h2><ul><li>Expand to European market</li><li>Launch enterprise tier</li><li>Improve onboarding flow</li></ul>',
    ],
  },
  {
    id: 'workshop',
    keywords: ['workshop', 'training', 'tutorial', 'guide', 'how to', 'introduction', 'basics'],
    title: 'Git & GitHub Workshop',
    slides: [
      '<h1>Git & GitHub</h1><p>Version control for modern developers</p>',
      '<h2>What is Git?</h2><p>A <strong>distributed version control system</strong> that tracks changes in your code</p>',
      '<h2>Essential Commands</h2><ul><li><strong>git init</strong> - Start a new repository</li><li><strong>git add</strong> - Stage changes</li><li><strong>git commit</strong> - Save changes</li><li><strong>git push</strong> - Upload to remote</li></ul>',
      '<h2>Branching Strategy</h2><p>Create feature branches for new work<br/>Merge back to main when complete</p>',
      '<h2>GitHub Workflow</h2><ul><li>Fork or clone repository</li><li>Create feature branch</li><li>Make changes and commit</li><li>Open pull request</li><li>Review and merge</li></ul>',
      '<h2>Best Practices</h2><ul><li>Write clear commit messages</li><li>Commit often, push regularly</li><li>Review code before merging</li><li>Keep branches up to date</li></ul>',
    ],
  },
];

export function findBestTemplate(prompt: string): DemoTemplate {
  const lowerPrompt = prompt.toLowerCase();
  
  for (const template of demoTemplates) {
    for (const keyword of template.keywords) {
      if (lowerPrompt.includes(keyword)) {
        return template;
      }
    }
  }
  
  return demoTemplates[0];
}
