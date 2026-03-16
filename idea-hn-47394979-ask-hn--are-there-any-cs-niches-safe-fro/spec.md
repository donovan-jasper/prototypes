# CareerShield

## One-line pitch
Stay ahead of AI disruption with personalized career intelligence that shows you which skills to build, which roles to target, and how to future-proof your tech career.

## Expanded vision

**Core audience:** Tech professionals (ages 22-45) navigating career uncertainty in the AI era.

**Broadest reach:** This isn't just for software engineers. It's for:
- **Product managers** wondering if AI will automate their roadmapping
- **Designers** concerned about generative design tools
- **Data analysts** watching AI handle their SQL queries
- **Marketing professionals** seeing AI write their copy
- **Finance/legal/healthcare workers** in tech-adjacent roles watching automation creep in
- **Parents and career counselors** helping young people choose college majors
- **Career switchers** (teachers, retail workers, etc.) evaluating tech bootcamps

**Adjacent use cases:**
- **Skill investment ROI calculator** — "Should I spend 6 months learning Rust or focus on system design?"
- **Job posting decoder** — Paste a job description, get AI-resistance score and skill gap analysis
- **Salary negotiation intel** — "This skill is rare and AI-resistant, here's your leverage"
- **Team planning for managers** — "Which roles should we hire humans for vs automate?"
- **Educational guidance** — High schoolers and parents choosing between CS, data science, or trades

**Why non-technical people want this:**
- Parents making $100k+ college investment decisions for their kids
- Career counselors need data-driven advice tools
- Anyone in a knowledge work job wondering "will I be replaced?"
- People considering expensive bootcamps/certifications want ROI validation

**The real insight:** This is a career insurance app. People pay for peace of mind and strategic clarity in uncertain times. It's not about learning — it's about knowing WHERE to invest your limited time and energy.

## Tech stack

- **Framework:** React Native (Expo SDK 52+)
- **Language:** TypeScript
- **Local storage:** expo-sqlite for offline-first career data, assessments, and cached insights
- **Navigation:** expo-router (file-based routing)
- **State:** React Context + hooks (no Redux for MVP)
- **API:** REST endpoints (mock for MVP, real backend later)
- **Charts:** react-native-chart-kit for skill trend visualizations
- **Auth:** expo-auth-session (Apple/Google sign-in for premium)
- **Payments:** expo-in-app-purchases (iOS) + react-native-iap (Android)
- **Testing:** Jest + React Native Testing Library

## Core features

1. **AI Resistance Score** — Input your current role/skills, get a 0-100 score showing automation risk with specific reasoning. Updates quarterly with market data. Free users get score only; premium gets detailed breakdown and mitigation strategies.

2. **Skill Roadmap Builder** — Interactive tool that shows which 3-5 skills to prioritize based on your current position and goals. Visualizes learning paths with time estimates and ROI projections. Free users see generic paths; premium gets personalized recommendations.

3. **Job Security Pulse** — Weekly digest of which tech niches are heating up or cooling down, with real job posting data and AI capability analysis. Free users get top 3 insights; premium gets full reports and historical trends.

4. **Career Scenario Planner** — "If I learn X skill and target Y role, what's my 3-year outlook?" Compare multiple paths side-by-side. Premium only.

5. **Expert Insights Feed** — Curated content from industry leaders about AI-resistant skills, with ability to ask questions (premium users get priority responses). Free users see headlines; premium gets full articles and Q&A access.

## Monetization strategy

**Free tier (the hook):**
- One-time AI Resistance Score for current role
- Basic skill recommendations (top 3 only)
- Weekly Job Security Pulse (top 3 trends)
- Access to public expert content (headlines only)

**Premium tier: $12.99/month or $99/year** (reasoning: higher than typical content apps because this is career insurance, not entertainment. Comparable to LinkedIn Premium Lite at $9.99 but with more specialized value)

**What's behind the paywall:**
- Unlimited AI Resistance Scores (test different roles/skills)
- Full personalized skill roadmaps with learning resources
- Complete Job Security Pulse reports with historical data
- Career Scenario Planner (compare multiple paths)
- Full expert articles and priority Q&A access
- Quarterly 1-on-1 coaching session (annual plan only)
- Job posting analyzer (paste any job, get instant analysis)

**Retention drivers:**
- Quarterly score updates create check-in habit
- Weekly pulse notifications keep app top-of-mind
- Skill roadmap progress tracking (sunk cost fallacy)
- Annual plan includes coaching session (high perceived value, low actual cost)
- Fear-based retention: "What if I miss the signal that my skills are becoming obsolete?"

**Conversion strategy:**
- Free users get score, then immediate paywall: "Unlock your personalized action plan"
- 7-day free trial of premium (requires payment method)
- Push notification after 2 weeks: "Your industry landscape has changed — see what's new" (premium feature)

## File structure

```
career-shield/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx              # Dashboard/Home
│   │   ├── score.tsx              # AI Resistance Score
│   │   ├── roadmap.tsx            # Skill Roadmap
│   │   ├── pulse.tsx              # Job Security Pulse
│   │   └── profile.tsx            # Settings/Premium
│   ├── _layout.tsx
│   ├── onboarding.tsx
│   ├── assessment.tsx             # Initial skill assessment
│   ├── scenario-planner.tsx       # Premium feature
│   └── paywall.tsx
├── components/
│   ├── ScoreCard.tsx
│   ├── SkillChart.tsx
│   ├── RoadmapTimeline.tsx
│   ├── PulseItem.tsx
│   ├── PremiumBadge.tsx
│   └── PaywallModal.tsx
├── lib/
│   ├── database.ts                # SQLite setup
│   ├── scoring.ts                 # AI resistance algorithm
│   ├── roadmap-generator.ts       # Skill path logic
│   ├── pulse-data.ts              # Market trend data
│   └── subscription.ts            # IAP logic
├── types/
│   └── index.ts
├── constants/
│   ├── skills.ts                  # Skill taxonomy
│   ├── roles.ts                   # Job role definitions
│   └── colors.ts
├── __tests__/
│   ├── scoring.test.ts
│   ├── roadmap-generator.test.ts
│   ├── database.test.ts
│   └── components/
│       ├── ScoreCard.test.tsx
│       └── RoadmapTimeline.test.tsx
├── assets/
│   ├── images/
│   └── fonts/
├── app.json
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Tests

**lib/__tests__/scoring.test.ts**
```typescript
import { calculateAIResistanceScore, getScoreCategory } from '../scoring';

describe('AI Resistance Scoring', () => {
  test('calculates score for software engineer role', () => {
    const score = calculateAIResistanceScore({
      role: 'software-engineer',
      skills: ['system-design', 'leadership', 'react'],
      experience: 5
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('higher score for human-centric skills', () => {
    const techScore = calculateAIResistanceScore({
      role: 'software-engineer',
      skills: ['javascript', 'html', 'css'],
      experience: 3
    });
    const leadershipScore = calculateAIResistanceScore({
      role: 'engineering-manager',
      skills: ['leadership', 'strategy', 'communication'],
      experience: 3
    });
    expect(leadershipScore).toBeGreaterThan(techScore);
  });

  test('categorizes scores correctly', () => {
    expect(getScoreCategory(85)).toBe('high');
    expect(getScoreCategory(60)).toBe('medium');
    expect(getScoreCategory(35)).toBe('low');
  });
});
```

**lib/__tests__/roadmap-generator.test.ts**
```typescript
import { generateSkillRoadmap, estimateLearningTime } from '../roadmap-generator';

describe('Skill Roadmap Generator', () => {
  test('generates roadmap for career transition', () => {
    const roadmap = generateSkillRoadmap({
      currentRole: 'frontend-developer',
      targetRole: 'engineering-manager',
      currentSkills: ['react', 'typescript'],
      experience: 4
    });
    expect(roadmap.skills).toContain('leadership');
    expect(roadmap.skills).toContain('system-design');
    expect(roadmap.timeline).toBeGreaterThan(0);
  });

  test('estimates realistic learning time', () => {
    const time = estimateLearningTime('system-design', 'intermediate');
    expect(time).toBeGreaterThan(0);
    expect(time).toBeLessThan(365); // Less than a year
  });

  test('prioritizes high-impact skills', () => {
    const roadmap = generateSkillRoadmap({
      currentRole: 'software-engineer',
      targetRole: 'senior-engineer',
      currentSkills: ['javascript'],
      experience: 2
    });
    expect(roadmap.skills[0]).toBe('system-design'); // Highest priority
  });
});
```

**lib/__tests__/database.test.ts**
```typescript
import { initDatabase, saveAssessment, getLatestScore } from '../database';

describe('Database Operations', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  test('saves and retrieves assessment', async () => {
    const assessment = {
      role: 'software-engineer',
      skills: ['react', 'node'],
      score: 72,
      timestamp: Date.now()
    };
    await saveAssessment(assessment);
    const retrieved = await getLatestScore();
    expect(retrieved?.score).toBe(72);
  });

  test('handles empty database', async () => {
    const score = await getLatestScore();
    expect(score).toBeNull();
  });
});
```

**components/__tests__/ScoreCard.test.tsx**
```typescript
import React from 'react';
import { render } from '@testing-library/react-native';
import ScoreCard from '../ScoreCard';

describe('ScoreCard Component', () => {
  test('renders score correctly', () => {
    const { getByText } = render(<ScoreCard score={85} category="high" />);
    expect(getByText('85')).toBeTruthy();
  });

  test('shows correct category label', () => {
    const { getByText } = render(<ScoreCard score={85} category="high" />);
    expect(getByText(/high resistance/i)).toBeTruthy();
  });

  test('displays low score warning', () => {
    const { getByText } = render(<ScoreCard score={30} category="low" />);
    expect(getByText(/action needed/i)).toBeTruthy();
  });
});
```

## Implementation steps

### Step 1: Project initialization
```bash
npx create-expo-app@latest career-shield --template tabs
cd career-shield
npm install expo-sqlite expo-router react-native-chart-kit
npm install --save-dev @types/react @types/react-native jest @testing-library/react-native @testing-library/jest-native
```

### Step 2: Configure TypeScript and testing
- Update `tsconfig.json` with strict mode
- Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect']
};
```

### Step 3: Define types (`types/index.ts`)
```typescript
export type Role = 'software-engineer' | 'engineering-manager' | 'product-manager' | 'designer' | 'data-scientist';
export type SkillCategory = 'technical' | 'leadership' | 'communication' | 'strategic';
export type ScoreCategory = 'low' | 'medium' | 'high';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  aiResistance: number; // 0-100
}

export interface Assessment {
  role: Role;
  skills: string[];
  experience: number;
  score?: number;
  timestamp: number;
}

export interface RoadmapSkill {
  skill: string;
  priority: number;
  estimatedWeeks: number;
  reason: string;
}

export interface Roadmap {
  skills: RoadmapSkill[];
  timeline: number; // total weeks
  targetRole: string;
}
```

### Step 4: Create constants (`constants/skills.ts`, `constants/roles.ts`)
```typescript
// skills.ts
export const SKILLS: Skill[] = [
  { id: 'system-design', name: 'System Design', category: 'technical', aiResistance: 75 },
  { id: 'leadership', name: 'Leadership', category: 'leadership', aiResistance: 90 },
  { id: 'communication', name: 'Communication', category: 'communication', aiResistance: 85 },
  { id: 'strategy', name: 'Strategic Thinking', category: 'strategic', aiResistance: 88 },
  { id: 'react', name: 'React', category: 'technical', aiResistance: 45 },
  { id: 'javascript', name: 'JavaScript', category: 'technical', aiResistance: 40 },
  // Add 20+ more skills
];

// roles.ts
export const ROLES = {
  'software-engineer': { name: 'Software Engineer', baseScore: 55 },
  'engineering-manager': { name: 'Engineering Manager', baseScore: 80 },
  'product-manager': { name: 'Product Manager', baseScore: 75 },
  // Add more roles
};
```

### Step 5: Implement database layer (`lib/database.ts`)
```typescript
import * as SQLite from 'expo-sqlite';
import { Assessment } from '../types';

let db: SQLite.SQLiteDatabase;

export async function initDatabase() {
  db = await SQLite.openDatabaseAsync('careershield.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      skills TEXT NOT NULL,
      score INTEGER,
      experience INTEGER,
      timestamp INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      is_premium INTEGER DEFAULT 0,
      subscription_expires INTEGER
    );
  `);
}

export async function saveAssessment(assessment: Assessment) {
  await db.runAsync(
    'INSERT INTO assessments (role, skills, score, experience, timestamp) VALUES (?, ?, ?, ?, ?)',
    [assessment.role, JSON.stringify(assessment.skills), assessment.score || 0, assessment.experience, assessment.timestamp]
  );
}

export async function getLatestScore(): Promise<Assessment | null> {
  const result = await db.getFirstAsync<any>(
    'SELECT * FROM assessments ORDER BY timestamp DESC LIMIT 1'
  );
  if (!result) return null;
  return {
    role: result.role,
    skills: JSON.parse(result.skills),
    score: result.score,
    experience: result.experience,
    timestamp: result.timestamp
  };
}

export async function isPremiumUser(): Promise<boolean> {
  const result = await db.getFirstAsync<any>('SELECT is_premium, subscription_expires FROM user_profile WHERE id = 1');
  if (!result) return false;
  return result.is_premium === 1 && result.subscription_expires > Date.now();
}
```

### Step 6: Implement scoring algorithm (`lib/scoring.ts`)
```typescript
import { SKILLS, ROLES } from '../constants/skills';
import { Assessment, ScoreCategory } from '../types';

export function calculateAIResistanceScore(assessment: Assessment): number {
  const roleBase = ROLES[assessment.role]?.baseScore || 50;
  
  const skillScores = assessment.skills.map(skillId => {
    const skill = SKILLS.find(s => s.id === skillId);
    return skill?.aiResistance || 50;
  });
  
  const avgSkillScore = skillScores.reduce((a, b) => a + b, 0) / skillScores.length;
  
  // Experience multiplier (more experience = slightly higher resistance)
  const experienceBonus = Math.min(assessment.experience * 2, 15);
  
  const finalScore = Math.round((roleBase * 0.4) + (avgSkillScore * 0.5) + experienceBonus);
  return Math.min(Math.max(finalScore, 0), 100);
}

export function getScoreCategory(score: number): ScoreCategory {
  if (score >= 70) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

export function getScoreInsights(score: number, role: string): string[] {
  const category = getScoreCategory(score);
  const insights: string[] = [];
  
  if (category === 'low') {
    insights.push('Your current role has high automation risk');
    insights.push('Focus on building human-centric skills immediately');
    insights.push('Consider transitioning to leadership or strategic roles');
  } else if (category === 'medium') {
    insights.push('Your role has moderate AI resistance');
    insights.push('Strengthen communication and system design skills');
    insights.push('Stay updated on emerging AI capabilities in your field');
  } else {
    insights.push('Your role is well-positioned against AI disruption');
    insights.push('Continue developing strategic and leadership capabilities');
    insights.push('Mentor others on building AI-resistant careers');
  }
  
  return insights;
}
```

### Step 7: Implement roadmap generator (`lib/roadmap-generator.ts`)
```typescript
import { SKILLS } from '../constants/skills';
import { Roadmap, RoadmapSkill } from '../types';

export function generateSkillRoadmap(params: {
  currentRole: string;
  targetRole: string;
  currentSkills: string[];
  experience: number;
}): Roadmap {
  const targetSkills = getTargetSkills(params.targetRole);
  const missingSkills = targetSkills.filter(s => !params.currentSkills.includes(s));
  
  const roadmapSkills: RoadmapSkill[] = missingSkills.map(skillId => {
    const skill = SKILLS.find(s => s.id === skillId);
    return {
      skill: skill?.name || skillId,
      priority: skill?.aiResistance || 50,
      estimatedWeeks: estimateLearningTime(skillId, 'intermediate'),
      reason: `Essential for ${params.targetRole} and highly AI-resistant`
    };
  }).sort((a, b) => b.priority - a.priority).slice(0, 5);
  
  const totalWeeks = roadmapSkills.reduce((sum, s) => sum + s.estimatedWeeks, 0);
  
  return {
    skills: roadmapSkills,
    timeline: totalWeeks,
    targetRole: params.targetRole
  };
}

export function estimateLearningTime(skillId: string, level: string): number {
  const baseWeeks: Record<string, number> = {
    'system-design': 16,
    'leadership': 24,
    'communication': 12,
    'strategy': 20,
    'react': 8,
    'javascript': 12
  };
  return baseWeeks[skillId] || 12;
}

function getTargetSkills(role: string): string[] {
  const roleSkills: Record<string, string[]> = {
    'engineering-manager': ['leadership', 'system-design', 'communication', 'strategy'],
    'senior-engineer': ['system-design', 'leadership', 'mentoring'],
    'product-manager': ['strategy', 'communication', 'user-research']
  };
  return roleSkills[role] || [];
}
```

### Step 8: Build core components (`components/ScoreCard.tsx`, etc.)
```typescript
// ScoreCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScoreCategory } from '../types';

interface Props {
  score: number;
  category: ScoreCategory;
}

export default function ScoreCard({ score, category }: Props) {
  const colors = {
    low: '#ef4444',
    medium: '#f59e0b',
    high: '#10b981'
  };
  
  return (
    <View style={[styles.card, { borderColor: colors[category] }]}>
      <Text style={styles.score}>{score}</Text>
      <Text style={styles.label}>AI Resistance Score</Text>
      <Text style={[styles.category, { color: colors[category] }]}>
        {category === 'high' ? 'High Resistance' : category === 'medium' ? 'Moderate Risk' : 'Action Needed'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  score: {
    fontSize: 64,
    fontWeight: 'bold'
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginTop: 8
  },
  category: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12
  }
});
```

### Step 9: Build main screens (`app/(tabs)/score.tsx`, etc.)
```typescript
// app/(tabs)/score.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScoreCard from '../../components/ScoreCard';
import { getLatestScore, isPremiumUser } from '../../lib/database';
import { getScoreCategory, getScoreInsights } from '../../lib/scoring';

export default function ScoreScreen() {
  const [score, setScore] = useState<number | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    loadScore();
  }, []);
  
  async function loadScore() {
    const latest = await getLatestScore();
    const premium = await isPremiumUser();
    setIsPremium(premium);
    
    if (latest?.score) {
      setScore(latest.score);
      setInsights(getScoreInsights(latest.score, latest.role));
    }
  }
  
  if (score === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Get Your AI Resistance Score</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/assessment')}
        >
          <Text style={styles.buttonText}>Start Assessment</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const category = getScoreCategory(score);
  
  return (
    <ScrollView style={styles.container}>
      <ScoreCard score={score} category={category} />
      
      <View style={styles.insights}>
        <Text style={styles.sectionTitle}>Key Insights</Text>
        {insights.slice(0, isPremium ? insights.length : 1).map((insight, i) => (
          <Text key={i} style={styles.insight}>• {insight}</Text>
        ))}
        {!isPremium && (
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => router.push('/paywall')}
          >
            <Text style={styles.upgradeText}>Unlock Full Analysis</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  insights: {
    marginTop: 32,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  insight: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    color: '#374151'
  },
  upgradeButton: {
    marginTop: 16,
    backgroundColor: '#8b5cf6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  upgradeText: {
    color: '#fff',
    fontWeight: '600'
  }
});
```

### Step 10: Build assessment flow (`app/assessment.tsx`)
```typescript
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SKILLS, ROLES } from '../constants/skills';
import { saveAssessment } from '../lib/database';
import { calculateAIResistanceScore } from '../lib/scoring';

export default function AssessmentScreen() {
  const [role, setRole] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState(0);
  const router = useRouter();
  
  async function submitAssessment() {
    const score = calculateAIResistanceScore({
      role: role as any,
      skills: selectedSkills,
      experience,
      timestamp: Date.now()
    });
    
    await saveAssessment({
      role: role as any,
      skills: selectedSkills,
      experience,
      score,
      timestamp: Date.now()
    });
    
    router.replace('/(tabs)/score');
  }
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Career Assessment</Text>
      
      <Text style={styles.label}>Current Role</Text>
      {Object.entries(ROLES).map(([key, value]) => (
        <TouchableOpacity
          key={key}
          style={[styles.option, role === key && styles.selected]}
          onPress={() => setRole(key)}
        >
          <Text>{value.name}</Text>
        </TouchableOpacity>
      ))}
      
      <Text style={styles.label}>Your Skills (select all that apply)</Text>
      {SKILLS.slice(0, 10).map(skill => (
        <TouchableOpacity
          key={skill.id}
          style={[styles.option, selectedSkills.includes(skill.id) && styles.selected]}
          onPress={() => {
            setSelectedSkills(prev => 
              prev.includes(skill.id) 
                ? prev.filter(s => s !== skill.id)
                : [...prev, skill.id]
            );
          }}
        >
          <Text>{skill.name}</Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity
        style={[styles.button, (!role || selectedSkills.length === 0) && styles.disabled]}
        onPress={submitAssessment}
        disabled={!role || selectedSkills.length === 0}
      >
        <Text style={styles.buttonText}>Get My Score</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12
  },
  option: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb'
  },
  selected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff'
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40
  },
  disabled: {
    backgroundColor: '#9ca3af'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  }
});
```

### Step 11: Implement paywall (`app/paywall.tsx`)
```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function PaywallScreen() {
  const router = useRouter();
  
  // In production, integrate expo-in-app-purchases here
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unlock CareerShield Premium</Text>
      
      <View style={styles.features}>
        <Text style={styles.feature}>✓ Unlimited AI Resistance Scores</Text>
        <Text style={styles.feature}>✓ Personalized Skill Roadmaps</Text>
        <Text style={styles.feature}>✓ Full Job Security Reports</Text>
        <Text style={styles.feature}>✓ Career Scenario Planner</Text>
        <Text style={styles.feature}>✓ Expert Q&A Access</Text>
      </View>
      
      <TouchableOpacity style={styles.priceButton}>
        <Text style={styles.priceText}>$12.99/month</Text>
        <Text style={styles.priceSubtext}>7-day free trial</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.annualButton}>
        <Text style={styles.annualText}>$99/year</Text>
        <Text style={styles.annualSubtext}>Save $56 + free coaching session</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.restore}>Restore Purchase</Text>
      </TouchableOpacity>
    </View>
  