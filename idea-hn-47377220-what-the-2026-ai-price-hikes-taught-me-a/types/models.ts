export enum TaskType {
  TEXT_GENERATION = 'text_generation',
  CODE_GENERATION = 'code_generation',
  IMAGE_GENERATION = 'image_generation',
  CHAT = 'chat',
  SUMMARIZATION = 'summarization'
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  inputCostPer1k: number;
  outputCostPer1k: number;
  qualityScore: number;
  speedRating: 'slow' | 'medium' | 'fast';
  capabilities: TaskType[];
  contextWindow: number;
}

export interface Task {
  description: string;
  type: TaskType;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
}

export interface ModelRecommendation {
  model: AIModel;
  costEstimate: number;
  efficiencyScore: number;
  reasoning: string;
}

export interface UsageEntry {
  id?: number;
  modelId: string;
  taskType: TaskType;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  timestamp: number;
}
