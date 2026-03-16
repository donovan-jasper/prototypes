import { Drill } from '../lib/types';

export const DRILLS: Drill[] = [
  {
    id: 'aim-training-1',
    name: 'Aim Training',
    description: 'Tap the targets as fast as you can',
    type: 'aim',
    difficulty: 'Beginner',
    duration: 30,
    bestScore: 0,
  },
  {
    id: 'timing-challenge-1',
    name: 'Timing Challenge',
    description: 'Tap at the exact moment the indicator appears',
    type: 'timing',
    difficulty: 'Beginner',
    duration: 30,
    bestScore: 0,
  },
  {
    id: 'swipe-pattern-1',
    name: 'Swipe Pattern',
    description: 'Replicate the swipe pattern shown',
    type: 'swipe',
    difficulty: 'Beginner',
    duration: 30,
    bestScore: 0,
  },
  {
    id: 'pattern-recognition-1',
    name: 'Pattern Recognition',
    description: 'Recall the sequence of colors shown',
    type: 'pattern',
    difficulty: 'Beginner',
    duration: 30,
    bestScore: 0,
  },
  {
    id: 'reflex-training-1',
    name: 'Reflex Training',
    description: 'React as fast as possible to visual/audio cues',
    type: 'reflex',
    difficulty: 'Beginner',
    duration: 30,
    bestScore: 0,
  },
];
