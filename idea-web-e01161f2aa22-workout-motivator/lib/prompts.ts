import { PROMPT_TEMPLATES, CoachId, PromptCategory } from '../constants/Prompts';

export function generatePrompt(coachId: CoachId, taskType: string): string {
  // Determine which category of prompts to use based on task type
  let category: PromptCategory = 'general';

  // Simple heuristic to select prompt category
  if (taskType.includes('workout') || taskType.includes('study')) {
    category = 'general';
  } else if (taskType.includes('meditation') || taskType.includes('breathwork')) {
    category = 'refocus';
  } else {
    // Default to general for other tasks
    category = 'general';
  }

  const prompts = PROMPT_TEMPLATES[coachId][category];
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
}

export function selectPromptByIntensity(coachId: CoachId, pauseDuration: number): string {
  // Select more intense prompts after longer pauses
  const category = pauseDuration > 300 ? 'encouragement' : 'general';
  const prompts = PROMPT_TEMPLATES[coachId][category];
  const randomIndex = Math.floor(Math.random() * prompts.length);
  return prompts[randomIndex];
}
