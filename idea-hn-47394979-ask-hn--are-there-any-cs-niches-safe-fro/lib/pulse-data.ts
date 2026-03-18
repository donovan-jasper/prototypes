export interface PulseTrend {
  id: string;
  skillName: string;
  direction: 'up' | 'down';
  percentage: string;
  insight: string;
  timestamp: number;
}

export const PULSE_TRENDS: PulseTrend[] = [
  {
    id: '1',
    skillName: 'AI Prompt Engineering',
    direction: 'up',
    percentage: '+127%',
    insight: 'Job postings requiring prompt engineering skills have surged as companies integrate LLMs into products. High demand for professionals who can optimize AI outputs.',
    timestamp: Date.now() - 86400000
  },
  {
    id: '2',
    skillName: 'System Design',
    direction: 'up',
    percentage: '+43%',
    insight: 'Senior roles increasingly emphasize architecture skills as AI handles routine coding. Companies value engineers who can design scalable systems.',
    timestamp: Date.now() - 172800000
  },
  {
    id: '3',
    skillName: 'Basic Frontend Development',
    direction: 'down',
    percentage: '-28%',
    insight: 'Entry-level frontend positions declining as AI tools like v0 and Cursor automate UI implementation. Focus shifting to design systems and accessibility.',
    timestamp: Date.now() - 259200000
  },
  {
    id: '4',
    skillName: 'Engineering Management',
    direction: 'up',
    percentage: '+35%',
    insight: 'Leadership roles growing as teams become more distributed and AI-augmented. Strong people skills and strategic thinking increasingly valuable.',
    timestamp: Date.now() - 345600000
  },
  {
    id: '5',
    skillName: 'Data Entry & Basic SQL',
    direction: 'down',
    percentage: '-52%',
    insight: 'Routine data manipulation tasks being automated by AI. Demand shifting toward data strategy and complex analytics requiring business context.',
    timestamp: Date.now() - 432000000
  },
  {
    id: '6',
    skillName: 'DevOps & Platform Engineering',
    direction: 'up',
    percentage: '+38%',
    insight: 'Infrastructure complexity growing with cloud-native architectures. Platform engineers who can build developer tools and improve workflows in high demand.',
    timestamp: Date.now() - 518400000
  },
  {
    id: '7',
    skillName: 'Manual QA Testing',
    direction: 'down',
    percentage: '-41%',
    insight: 'Test automation and AI-powered testing tools reducing need for manual testers. Shift toward test strategy and quality engineering roles.',
    timestamp: Date.now() - 604800000
  },
  {
    id: '8',
    skillName: 'Product Management',
    direction: 'up',
    percentage: '+29%',
    insight: 'Strategic product thinking becoming more critical as AI handles tactical execution. PMs who can identify user needs and market opportunities highly valued.',
    timestamp: Date.now() - 691200000
  }
];
