export interface VoicePack {
  name: string;
  displayName: string;
  pitch: number;
  rate: number;
  isPremium: boolean;
  messages: {
    start: string;
    midpoint: string;
    end: string;
    pause: string;
    resume: string;
  };
}

export const VoicePacks: VoicePack[] = [
  {
    name: 'default',
    displayName: 'Friendly Coach',
    pitch: 1.0,
    rate: 1.0,
    isPremium: false,
    messages: {
      start: "Great! Let's focus for {duration} minutes. You got this!",
      midpoint: "Halfway there! Keep going - you're doing amazing!",
      end: "Well done! You've completed your {duration} minute focus session.",
      pause: "Session paused. Take a break if you need to.",
      resume: "Let's get back to work. You're stronger than you think!",
    },
  },
  {
    name: 'motivational',
    displayName: 'Motivational Mentor',
    pitch: 1.1,
    rate: 1.1,
    isPremium: true,
    messages: {
      start: "Alright, let's crush this {duration} minute sprint! You're going to dominate today!",
      midpoint: "You're killing it! Halfway complete - keep that momentum going!",
      end: "Incredible work! You just crushed a {duration} minute focus session. That's what I call discipline!",
      pause: "Pausing? That's okay. Just remember why you started.",
      resume: "Back at it! You're unstoppable. Let's finish this!",
    },
  },
  {
    name: 'chill',
    displayName: 'Chill Guide',
    pitch: 0.9,
    rate: 0.9,
    isPremium: true,
    messages: {
      start: "Let's take this {duration} minute session nice and easy. Breathe, relax, and focus.",
      midpoint: "Halfway done! You're doing great. Take a moment to enjoy this quiet focus time.",
      end: "Beautiful work! You've completed your {duration} minute session. Take a moment to celebrate your progress.",
      pause: "Pausing? That's okay. Just remember to come back when you're ready.",
      resume: "Welcome back! Let's continue this peaceful focus session.",
    },
  },
];
