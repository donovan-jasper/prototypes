export interface Cycle {
  id?: number;
  startDate: string;
  endDate?: string;
  predictedEndDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PatternAnalysis {
  isIrregular: boolean;
  averageLength: number;
  recentTrend: 'increasing' | 'decreasing' | 'stable' | 'unknown';
  confidence: number;
  fallbackPrediction: Date | null;
}
