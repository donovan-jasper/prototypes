const problems = [
  // Logic - Easy
  {
    question: "If all roses are flowers and some flowers fade quickly, which statement must be true?",
    options: [
      "All roses fade quickly",
      "Some roses are flowers",
      "No flowers are roses",
      "All flowers fade quickly"
    ],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "easy"
  },
  {
    question: "Which number comes next in the sequence: 2, 4, 6, 8, ?",
    options: ["9", "10", "11", "12"],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "easy"
  },
  {
    question: "If A is taller than B, and B is taller than C, who is the shortest?",
    options: ["A", "B", "C", "Cannot determine"],
    correctAnswer: 2,
    domain: "logic",
    difficulty: "easy"
  },
  {
    question: "All cats are mammals. Felix is a cat. Therefore:",
    options: [
      "Felix is not a mammal",
      "Felix is a mammal",
      "Some cats are not mammals",
      "Felix might be a mammal"
    ],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "easy"
  },

  // Logic - Medium
  {
    question: "If it rains, the ground gets wet. The ground is wet. What can we conclude?",
    options: [
      "It must have rained",
      "It might have rained",
      "It did not rain",
      "The ground is always wet"
    ],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "medium"
  },
  {
    question: "In a group of 5 people, everyone shakes hands with everyone else exactly once. How many handshakes occur?",
    options: ["5", "10", "15", "20"],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "medium"
  },
  {
    question: "Which word does NOT belong: Apple, Banana, Carrot, Orange?",
    options: ["Apple", "Banana", "Carrot", "Orange"],
    correctAnswer: 2,
    domain: "logic",
    difficulty: "medium"
  },
  {
    question: "If some doctors are teachers and all teachers are patient, which must be true?",
    options: [
      "All doctors are patient",
      "Some doctors are patient",
      "No doctors are patient",
      "All patient people are doctors"
    ],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "medium"
  },

  // Logic - Hard
  {
    question: "Three switches outside a room control three bulbs inside. You can flip switches but enter only once. How do you determine which switch controls which bulb?",
    options: [
      "Flip all switches and check",
      "Flip one switch, wait, flip another, then check temperature and light",
      "Flip switches randomly",
      "It's impossible"
    ],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "hard"
  },
  {
    question: "A bat and ball cost $1.10 total. The bat costs $1 more than the ball. How much does the ball cost?",
    options: ["$0.10", "$0.05", "$0.15", "$0.20"],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "hard"
  },
  {
    question: "You have 12 balls, one is slightly heavier. Using a balance scale only 3 times, how can you find the heavy ball?",
    options: [
      "Weigh them all individually",
      "Divide into groups of 4, then narrow down",
      "Divide into groups of 6",
      "It cannot be done in 3 weighings"
    ],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "hard"
  },

  // Math - Easy
  {
    question: "What is 15 + 27?",
    options: ["40", "42", "43", "45"],
    correctAnswer: 1,
    domain: "math",
    difficulty: "easy"
  },
  {
    question: "What is 8 × 7?",
    options: ["54", "56", "58", "60"],
    correctAnswer: 1,
    domain: "math",
    difficulty: "easy"
  },
  {
    question: "What is 50% of 80?",
    options: ["30", "35", "40", "45"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "easy"
  },
  {
    question: "If a rectangle has length 6 and width 4, what is its area?",
    options: ["20", "22", "24", "26"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "easy"
  },

  // Math - Medium
  {
    question: "What is the value of x in: 3x + 5 = 20?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "medium"
  },
  {
    question: "A train travels 120 miles in 2 hours. What is its average speed?",
    options: ["50 mph", "55 mph", "60 mph", "65 mph"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "medium"
  },
  {
    question: "What is 25% of 200?",
    options: ["40", "45", "50", "55"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "medium"
  },
  {
    question: "If a shirt costs $40 after a 20% discount, what was the original price?",
    options: ["$45", "$48", "$50", "$52"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "medium"
  },

  // Math - Hard
  {
    question: "What is the sum of the first 10 prime numbers?",
    options: ["127", "129", "131", "133"],
    correctAnswer: 1,
    domain: "math",
    difficulty: "hard"
  },
  {
    question: "If f(x) = 2x² - 3x + 1, what is f(3)?",
    options: ["8", "10", "12", "14"],
    correctAnswer: 1,
    domain: "math",
    difficulty: "hard"
  },
  {
    question: "A cylinder has radius 3 and height 5. What is its volume? (Use π ≈ 3.14)",
    options: ["141.3", "145.5", "147.0", "150.2"],
    correctAnswer: 0,
    domain: "math",
    difficulty: "hard"
  },

  // Verbal - Easy
  {
    question: "Which word is closest in meaning to 'happy'?",
    options: ["Sad", "Joyful", "Angry", "Tired"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "easy"
  },
  {
    question: "Which word is the opposite of 'hot'?",
    options: ["Warm", "Cool", "Cold", "Freezing"],
    correctAnswer: 2,
    domain: "verbal",
    difficulty: "easy"
  },
  {
    question: "Complete the analogy: Cat is to Kitten as Dog is to ___",
    options: ["Puppy", "Cub", "Calf", "Foal"],
    correctAnswer: 0,
    domain: "verbal",
    difficulty: "easy"
  },
  {
    question: "Which word does NOT belong: Run, Jump, Sleep, Sprint?",
    options: ["Run", "Jump", "Sleep", "Sprint"],
    correctAnswer: 2,
    domain: "verbal",
    difficulty: "easy"
  },

  // Verbal - Medium
  {
    question: "Which word best completes: 'The evidence was ___; it could not be disputed.'",
    options: ["Ambiguous", "Irrefutable", "Questionable", "Dubious"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "medium"
  },
  {
    question: "Book is to Library as Art is to ___",
    options: ["Museum", "Theater", "Concert", "Stadium"],
    correctAnswer: 0,
    domain: "verbal",
    difficulty: "medium"
  },
  {
    question: "Which word means 'to make worse'?",
    options: ["Ameliorate", "Exacerbate", "Mitigate", "Alleviate"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "medium"
  },
  {
    question: "What is the meaning of 'ephemeral'?",
    options: ["Lasting forever", "Very short-lived", "Extremely large", "Highly valuable"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "medium"
  },

  // Verbal - Hard
  {
    question: "Which word is most nearly opposite to 'laconic'?",
    options: ["Verbose", "Brief", "Concise", "Terse"],
    correctAnswer: 0,
    domain: "verbal",
    difficulty: "hard"
  },
  {
    question: "Mendacious is to Truthful as Parsimonious is to ___",
    options: ["Generous", "Stingy", "Careful", "Wealthy"],
    correctAnswer: 0,
    domain: "verbal",
    difficulty: "hard"
  },
  {
    question: "What does 'obfuscate' mean?",
    options: ["To clarify", "To confuse or obscure", "To simplify", "To organize"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "hard"
  },

  // Strategy - Easy
  {
    question: "You have $100 to invest. Option A returns 10% guaranteed. Option B might return 20% or lose 10%. Which is safer?",
    options: ["Option A", "Option B", "Both equal", "Neither"],
    correctAnswer: 0,
    domain: "strategy",
    difficulty: "easy"
  },
  {
    question: "To finish a project faster, should you: work longer hours, delegate tasks, or skip quality checks?",
    options: ["Work longer hours", "Delegate tasks", "Skip quality checks", "Do nothing"],
    correctAnswer: 1,
    domain: "strategy",
    difficulty: "easy"
  },
  {
    question: "You're lost in a city. What's the best first step?",
    options: ["Keep walking randomly", "Ask for directions", "Panic", "Sit down"],
    correctAnswer: 1,
    domain: "strategy",
    difficulty: "easy"
  },

  // Strategy - Medium
  {
    question: "A company can invest in marketing or R&D. Marketing gives quick returns, R&D gives long-term advantage. Budget allows only one. What factors matter most?",
    options: [
      "Only current cash flow",
      "Market position and competition timeline",
      "Employee preferences",
      "Random choice"
    ],
    correctAnswer: 1,
    domain: "strategy",
    difficulty: "medium"
  },
  {
    question: "You manage a team with conflicting priorities. How do you resolve it?",
    options: [
      "Ignore the conflict",
      "Align priorities with business goals and communicate",
      "Let them fight it out",
      "Choose randomly"
    ],
    correctAnswer: 1,
    domain: "strategy",
    difficulty: "medium"
  },
  {
    question: "In a negotiation, the other party makes an aggressive first offer. Your best response?",
    options: [
      "Accept immediately",
      "Counter with data and alternative proposals",
      "Walk away immediately",
      "Get angry"
    ],
    correctAnswer: 1,
    domain: "strategy",
    difficulty: "medium"
  },

  // Strategy - Hard
  {
    question: "A startup has 6 months of runway. Should they: cut costs and extend runway, pivot product, or raise more funding?",
    options: [
      "Always cut costs",
      "Depends on product-market fit and growth trajectory",
      "Always pivot",
      "Always raise funding"
    ],
    correctAnswer: 1,
    domain: "strategy",
    difficulty: "hard"
  },
  {
    question: "You discover a competitor's weakness. Do you: exploit it immediately, build long-term moat, or ignore it?",
    options: [
      "Exploit immediately",
      "Build sustainable competitive advantage",
      "Ignore it",
      "Tell the competitor"
    ],
    correctAnswer: 1,
    domain: "strategy",
    difficulty: "hard"
  },
  {
    question: "Your team is burned out but a critical deadline looms. Best approach?",
    options: [
      "Push harder regardless",
      "Assess critical path, cut scope, and protect team health",
      "Miss the deadline",
      "Hire more people immediately"
    ],
    correctAnswer: 1,
    domain: "strategy",
    difficulty: "hard"
  }
];

export function getRandomProblems(count, difficulty = null) {
  let filtered = difficulty 
    ? problems.filter(p => p.difficulty === difficulty)
    : problems;
  
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getProblemsByDomain(domain, count) {
  const filtered = problems.filter(p => p.domain === domain);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function getProblemsByDifficulty(difficulty) {
  return problems.filter(p => p.difficulty === difficulty);
}

export default problems;
