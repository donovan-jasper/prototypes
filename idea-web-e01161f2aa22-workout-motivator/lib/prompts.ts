import { PROMPT_TEMPLATES, CoachId, PromptCategory } from '../constants/Prompts';

const usedPrompts = new Map<string, Set<string>>();

export function generatePrompt(
  coachId: CoachId,
  taskType: string = 'general',
  category: PromptCategory = 'general'
): string {
  const templates = PROMPT_TEMPLATES[coachId];
  if (!templates) {
    return 'Keep going!';
  }

  const prompts = templates[category];
  const key = `${coachId}-${category}`;
  
  if (!usedPrompts.has(key)) {
    usedPrompts.set(key, new Set());
  }
  
  const used = usedPrompts.get(key)!;
  
  // Reset if all prompts have been used
  if (used.size >= prompts.length) {
    used.clear();
  }
  
  // Find unused prompts
  const available = prompts.filter(p => !used.has(p));
  
  // Select random prompt
  const selectedPrompt = available[Math.floor(Math.random() * available.length)];
  used.add(selectedPrompt);
  
  return selectedPrompt;
}

export function selectPromptByIntensity(
  coachId: CoachId,
  secondsSinceLastPrompt: number
): string {
  // If it's been more than 4 minutes, use refocus prompts
  if (secondsSinceLastPrompt > 240) {
    return generatePrompt(coachId, 'general', 'refocus');
  }
  
  // Random chance for encouragement (20%)
  if (Math.random() < 0.2) {
    return generatePrompt(coachId, 'general', 'encouragement');
  }
  
  // Default to general prompts
  return generatePrompt(coachId, 'general', 'general');
}

export function getRandomInterval(): number {
  // Return random interval between 120-300 seconds (2-5 minutes)
  return Math.floor(Math.random() * (300 - 120 + 1)) + 120;
}
