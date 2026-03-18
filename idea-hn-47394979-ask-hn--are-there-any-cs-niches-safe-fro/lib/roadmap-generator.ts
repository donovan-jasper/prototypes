import { SKILLS, ROLES } from '../constants/skills';
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
      reason: `Essential for ${ROLES[params.targetRole]?.name || params.targetRole} and highly AI-resistant`
    };
  }).sort((a, b) => b.priority - a.priority);
  
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
    'mentoring': 20,
    'negotiation': 16,
    'user-research': 12,
    'product-vision': 18,
    'stakeholder-management': 14,
    'team-building': 22,
    'react': 8,
    'javascript': 12,
    'typescript': 10,
    'python': 10,
    'sql': 8,
    'aws': 14,
    'kubernetes': 16,
    'machine-learning': 20,
    'data-analysis': 12,
    'ui-design': 14
  };
  return baseWeeks[skillId] || 12;
}

function getTargetSkills(role: string): string[] {
  const roleSkills: Record<string, string[]> = {
    'engineering-manager': ['leadership', 'system-design', 'communication', 'strategy', 'mentoring', 'team-building'],
    'tech-lead': ['system-design', 'leadership', 'mentoring', 'communication'],
    'senior-engineer': ['system-design', 'leadership', 'mentoring'],
    'product-manager': ['strategy', 'communication', 'user-research', 'product-vision', 'stakeholder-management'],
    'designer': ['ui-design', 'user-research', 'communication'],
    'data-scientist': ['machine-learning', 'data-analysis', 'python', 'sql'],
    'devops-engineer': ['kubernetes', 'aws', 'system-design'],
    'frontend-developer': ['react', 'typescript', 'javascript', 'ui-design'],
    'backend-developer': ['system-design', 'sql', 'python', 'aws'],
    'qa-engineer': ['communication', 'system-design'],
    'software-engineer': ['system-design', 'typescript', 'communication']
  };
  return roleSkills[role] || [];
}
