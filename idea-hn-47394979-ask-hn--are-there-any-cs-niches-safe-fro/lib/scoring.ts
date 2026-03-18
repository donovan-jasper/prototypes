import { SKILLS, ROLES } from '../constants/skills';
import { Assessment, ScoreCategory } from '../types';

export function calculateAIResistanceScore(assessment: Assessment): number {
  const roleBase = ROLES[assessment.role]?.baseScore || 50;
  
  const skillScores = assessment.skills.map(skillId => {
    const skill = SKILLS.find(s => s.id === skillId);
    return skill?.aiResistance || 50;
  });
  
  const avgSkillScore = skillScores.reduce((a, b) => a + b, 0) / skillScores.length;
  
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
