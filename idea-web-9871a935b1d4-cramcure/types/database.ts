export interface Cycle {
  id?: number;
  startDate: string;
  endDate?: string;
  predictedNextStart?: string;
}

export interface Symptom {
  id?: number;
  date: string;
  cycleDay?: number;
  painLevel: number;
  location?: string;
  type?: string;
  mood?: string;
  energy?: number;
  notes?: string;
}

export interface ReliefSession {
  id?: number;
  exerciseId: string;
  date: string;
  beforePain: number;
  afterPain: number;
  duration: number;
}
