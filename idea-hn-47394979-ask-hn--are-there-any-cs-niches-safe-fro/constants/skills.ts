import { Skill } from '../types';

export const SKILLS: Skill[] = [
  { id: 'system-design', name: 'System Design', category: 'technical', aiResistance: 75 },
  { id: 'leadership', name: 'Leadership', category: 'leadership', aiResistance: 90 },
  { id: 'communication', name: 'Communication', category: 'communication', aiResistance: 85 },
  { id: 'strategy', name: 'Strategic Thinking', category: 'strategic', aiResistance: 88 },
  { id: 'mentoring', name: 'Mentoring', category: 'leadership', aiResistance: 92 },
  { id: 'negotiation', name: 'Negotiation', category: 'communication', aiResistance: 87 },
  { id: 'user-research', name: 'User Research', category: 'strategic', aiResistance: 78 },
  { id: 'product-vision', name: 'Product Vision', category: 'strategic', aiResistance: 82 },
  { id: 'stakeholder-management', name: 'Stakeholder Management', category: 'communication', aiResistance: 86 },
  { id: 'team-building', name: 'Team Building', category: 'leadership', aiResistance: 91 },
  { id: 'react', name: 'React', category: 'technical', aiResistance: 45 },
  { id: 'javascript', name: 'JavaScript', category: 'technical', aiResistance: 40 },
  { id: 'typescript', name: 'TypeScript', category: 'technical', aiResistance: 42 },
  { id: 'python', name: 'Python', category: 'technical', aiResistance: 38 },
  { id: 'sql', name: 'SQL', category: 'technical', aiResistance: 35 },
  { id: 'aws', name: 'AWS', category: 'technical', aiResistance: 52 },
  { id: 'kubernetes', name: 'Kubernetes', category: 'technical', aiResistance: 58 },
  { id: 'machine-learning', name: 'Machine Learning', category: 'technical', aiResistance: 48 },
  { id: 'data-analysis', name: 'Data Analysis', category: 'technical', aiResistance: 43 },
  { id: 'ui-design', name: 'UI Design', category: 'technical', aiResistance: 50 }
];

export const ROLES: Record<string, { name: string; baseScore: number }> = {
  'software-engineer': { name: 'Software Engineer', baseScore: 55 },
  'engineering-manager': { name: 'Engineering Manager', baseScore: 80 },
  'product-manager': { name: 'Product Manager', baseScore: 75 },
  'designer': { name: 'Designer', baseScore: 62 },
  'data-scientist': { name: 'Data Scientist', baseScore: 58 },
  'devops-engineer': { name: 'DevOps Engineer', baseScore: 60 },
  'frontend-developer': { name: 'Frontend Developer', baseScore: 52 },
  'backend-developer': { name: 'Backend Developer', baseScore: 56 },
  'tech-lead': { name: 'Tech Lead', baseScore: 72 },
  'qa-engineer': { name: 'QA Engineer', baseScore: 48 }
};
