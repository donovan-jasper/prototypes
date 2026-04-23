// Add to existing schema.ts
export interface CueEventRecord {
  id: string;
  session_id: string;
  timestamp: number;
  cue_type: 'audio' | 'haptic' | 'both';
  intensity: number;
}
