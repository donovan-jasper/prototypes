export type Role = 'software-engineer' | 'engineering-manager' | 'product-manager' | 'designer' | 'data-scientist' | 'devops-engineer' | 'frontend-developer' | 'backend-developer' | 'tech-lead' | 'qa-engineer';
export type SkillCategory = 'technical' | 'leadership' | 'communication' | 'strategic';
export type ScoreCategory = 'low' | 'medium' | 'high';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  aiResistance: number;
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
  timeline: number;
  targetRole: string;
}
