export const VoicePacks = [
  {
    name: 'default',
    displayName: 'Friendly',
    pitch: 1.0,
    rate: 1.0,
    messages: {
      start: "Let's crush this {duration}-minute sprint! You got this!",
      midpoint: "Halfway there! Keep pushing forward.",
      end: "Amazing work! Session complete. Great job!",
    },
  },
  {
    name: 'motivational',
    displayName: 'Motivational',
    pitch: 1.2,
    rate: 1.1,
    messages: {
      start: "You're about to dominate your {duration}-minute sprint! Unleash your power!",
      midpoint: "You're crushing it! Keep that momentum going!",
      end: "Incredible job! You've completed your sprint with excellence!",
    },
    premium: true,
  },
  {
    name: 'chill',
    displayName: 'Chill',
    pitch: 0.9,
    rate: 0.9,
    messages: {
      start: "Let's take this {duration}-minute sprint at a relaxed pace. Breathe and focus.",
      midpoint: "You're doing great! Take a moment to enjoy this focused time.",
      end: "Well done! You've completed your sprint. Take a moment to relax.",
    },
    premium: true,
  },
  {
    name: 'drillSergeant',
    displayName: 'Drill Sergeant',
    pitch: 1.1,
    rate: 1.0,
    messages: {
      start: "Attention! You have a {duration}-minute sprint to complete. Get to work!",
      midpoint: "You're making progress! Keep up the good work, soldier!",
      end: "Mission accomplished! You've completed your sprint. Well done!",
    },
    premium: true,
  },
  {
    name: 'celebrity',
    displayName: 'Celebrity',
    pitch: 1.0,
    rate: 1.0,
    messages: {
      start: "Wow, {duration} minutes of focused work? Let's make it legendary!",
      midpoint: "You're on fire! Keep that energy going, superstar!",
      end: "Bravo! You've completed your sprint. You're a work machine!",
    },
    premium: true,
  },
  {
    name: 'asmr',
    displayName: 'ASMR',
    pitch: 0.8,
    rate: 0.8,
    messages: {
      start: "Let's begin your {duration}-minute sprint. Focus and relax.",
      midpoint: "You're doing so well. Keep that focused energy going.",
      end: "Perfect! You've completed your sprint. Great job!",
    },
    premium: true,
  },
];
