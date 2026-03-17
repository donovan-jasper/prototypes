export interface Exercise {
  id: string;
  name: string;
  duration: number;
  instructions: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  postureType: 'chin' | 'shoulder' | 'neck' | 'spine';
}

export const exercises: Exercise[] = [
  {
    id: 'chin-tuck',
    name: 'Chin Tuck',
    duration: 15,
    instructions: 'Gently tuck your chin to your chest and hold for 15 seconds. Keep your shoulders relaxed.',
    difficulty: 'beginner',
    postureType: 'chin',
  },
  {
    id: 'shoulder-squeeze',
    name: 'Shoulder Blade Squeeze',
    duration: 20,
    instructions: 'Squeeze your shoulder blades together and hold for 20 seconds. Imagine pulling your shoulder blades back.',
    difficulty: 'beginner',
    postureType: 'shoulder',
  },
  {
    id: 'neck-roll',
    name: 'Neck Roll',
    duration: 10,
    instructions: 'Slowly roll your head in a circular motion for 10 seconds. Keep your shoulders relaxed.',
    difficulty: 'beginner',
    postureType: 'neck',
  },
  {
    id: 'cat-cow',
    name: 'Cat-Cow Stretch',
    duration: 30,
    instructions: 'Arch and round your back in a cat-cow motion for 30 seconds. Keep your movements slow and controlled.',
    difficulty: 'intermediate',
    postureType: 'spine',
  },
  {
    id: 'seated-spinal-twist',
    name: 'Seated Spinal Twist',
    duration: 25,
    instructions: 'Sit with legs extended and twist your torso to each side for 25 seconds. Keep your shoulders relaxed.',
    difficulty: 'intermediate',
    postureType: 'spine',
  },
  {
    id: 'forward-head-posture',
    name: 'Forward Head Posture',
    duration: 15,
    instructions: 'Tilt your head forward slightly and hold for 15 seconds. This helps correct rounded shoulders.',
    difficulty: 'intermediate',
    postureType: 'chin',
  },
  {
    id: 'scapular-retraction',
    name: 'Scapular Retraction',
    duration: 20,
    instructions: 'Retract your shoulder blades and hold for 20 seconds. Imagine pulling your shoulder blades back and down.',
    difficulty: 'advanced',
    postureType: 'shoulder',
  },
];

export const getExerciseById = (id: string): Exercise | undefined => {
  return exercises.find((exercise) => exercise.id === id);
};

export const getRoutineExercises = (): Exercise[] => {
  return exercises.slice(0, 5);
};

export const calculateRoutineDuration = (exerciseIds: string[]): number => {
  return exerciseIds.reduce((total, id) => {
    const exercise = getExerciseById(id);
    return total + (exercise?.duration || 0);
  }, 0);
};

export const validateExerciseCompletion = (id: string, duration: number, reps: number): boolean => {
  const exercise = getExerciseById(id);
  if (!exercise) return false;

  if (exercise.difficulty === 'beginner') {
    return duration >= exercise.duration;
  } else if (exercise.difficulty === 'intermediate') {
    return duration >= exercise.duration && reps >= 3;
  } else {
    return duration >= exercise.duration && reps >= 5;
  }
};
