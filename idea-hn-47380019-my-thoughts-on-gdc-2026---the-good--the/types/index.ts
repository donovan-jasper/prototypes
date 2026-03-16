export interface Attribution {
  model: string;
  prompt: string;
  timestamp: string;
  attributionId: string;
}

export interface Generation {
  id: number;
  prompt: string;
  imageUri: string;
  attribution: Attribution;
  timestamp: Date;
}

export interface User {
  premiumStatus: boolean;
  generationCount: number;
  totalScore: number;
}
