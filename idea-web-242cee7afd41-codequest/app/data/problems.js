const problems = [
  // Logic - Easy
  {
    id: 1,
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
    id: 2,
    question: "Which number comes next in the sequence: 2, 4, 6, 8, ?",
    options: ["9", "10", "11", "12"],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "easy"
  },
  {
    id: 3,
    question: "If A is taller than B, and B is taller than C, who is the shortest?",
    options: ["A", "B", "C", "Cannot determine"],
    correctAnswer: 2,
    domain: "logic",
    difficulty: "easy"
  },
  {
    id: 4,
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
    id: 5,
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
    id: 6,
    question: "In a group of 5 people, everyone shakes hands with everyone else exactly once. How many handshakes occur?",
    options: ["5", "10", "15", "20"],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "medium"
  },
  {
    id: 7,
    question: "Which word does NOT belong: Apple, Banana, Carrot, Orange?",
    options: ["Apple", "Banana", "Carrot", "Orange"],
    correctAnswer: 2,
    domain: "logic",
    difficulty: "medium"
  },
  {
    id: 8,
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
    id: 9,
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
    id: 10,
    question: "A bat and ball cost $1.10 total. The bat costs $1 more than the ball. How much does the ball cost?",
    options: ["$0.10", "$0.05", "$0.15", "$0.20"],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "hard"
  },
  {
    id: 11,
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
    id: 12,
    question: "What is 15 + 27?",
    options: ["40", "42", "43", "45"],
    correctAnswer: 1,
    domain: "math",
    difficulty: "easy"
  },
  {
    id: 13,
    question: "What is 8 × 7?",
    options: ["54", "56", "58", "60"],
    correctAnswer: 1,
    domain: "math",
    difficulty: "easy"
  },
  {
    id: 14,
    question: "What is 50% of 80?",
    options: ["30", "35", "40", "45"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "easy"
  },
  {
    id: 15,
    question: "If a rectangle has length 6 and width 4, what is its area?",
    options: ["20", "22", "24", "26"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "easy"
  },

  // Math - Medium
  {
    id: 16,
    question: "What is the value of x in: 3x + 5 = 20?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "medium"
  },
  {
    id: 17,
    question: "A train travels 120 miles in 2 hours. What is its average speed?",
    options: ["50 mph", "55 mph", "60 mph", "65 mph"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "medium"
  },
  {
    id: 18,
    question: "What is 25% of 200?",
    options: ["40", "45", "50", "55"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "medium"
  },
  {
    id: 19,
    question: "If a shirt costs $40 after a 20% discount, what was the original price?",
    options: ["$45", "$48", "$50", "$52"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "medium"
  },

  // Math - Hard
  {
    id: 20,
    question: "What is the sum of the first 10 prime numbers?",
    options: ["127", "129", "131", "133"],
    correctAnswer: 1,
    domain: "math",
    difficulty: "hard"
  },
  {
    id: 21,
    question: "If f(x) = 2x² - 3x + 1, what is f(3)?",
    options: ["8", "10", "12", "14"],
    correctAnswer: 1,
    domain: "math",
    difficulty: "hard"
  },
  {
    id: 22,
    question: "What is the derivative of x³ + 2x - 5?",
    options: ["3x² + 2", "x² + 2x", "3x² + 2x", "x² - 5"],
    correctAnswer: 1,
    domain: "math",
    difficulty: "hard"
  },

  // Verbal - Easy
  {
    id: 23,
    question: "What is the antonym of 'happy'?",
    options: ["Joyful", "Sad", "Angry", "Excited"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "easy"
  },
  {
    id: 24,
    question: "Which word is a synonym for 'quickly'?",
    options: ["Slowly", "Rapidly", "Quietly", "Loudly"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "easy"
  },
  {
    id: 25,
    question: "What is the plural of 'child'?",
    options: ["Childs", "Childes", "Children", "Childrens"],
    correctAnswer: 2,
    domain: "verbal",
    difficulty: "easy"
  },
  {
    id: 26,
    question: "Which sentence is grammatically correct?",
    options: [
      "She don't like apples",
      "She doesn't like apples",
      "She don't likes apples",
      "She doesn't likes apples"
    ],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "easy"
  },

  // Verbal - Medium
  {
    id: 27,
    question: "Identify the sentence with correct subject-verb agreement:",
    options: [
      "The team of scientists is studying the phenomenon",
      "The team of scientists are studying the phenomenon",
      "The team of scientists is studying the phenomenons",
      "The team of scientists are studying the phenomenons"
    ],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "medium"
  },
  {
    id: 28,
    question: "Which sentence uses the correct idiom?",
    options: [
      "She's in the mood for a challenge",
      "She's in the mood for a fight",
      "She's in the mood for a walk",
      "She's in the mood for a nap"
    ],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "medium"
  },
  {
    id: 29,
    question: "What is the correct form of the verb in: 'If I were you, I would...'",
    options: ["go", "goes", "going", "gone"],
    correctAnswer: 2,
    domain: "verbal",
    difficulty: "medium"
  },
  {
    id: 30,
    question: "Which sentence is written in passive voice?",
    options: [
      "The chef cooked the meal",
      "The meal was cooked by the chef",
      "The chef will cook the meal",
      "The meal is being cooked by the chef"
    ],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "medium"
  },

  // Verbal - Hard
  {
    id: 31,
    question: "Identify the sentence with correct parallel structure:",
    options: [
      "She enjoys reading, to write, and writing poetry",
      "She enjoys reading, writing, and to write poetry",
      "She enjoys to read, writing, and writing poetry",
      "She enjoys reading, writing, and writing poetry"
    ],
    correctAnswer: 3,
    domain: "verbal",
    difficulty: "hard"
  },
  {
    id: 32,
    question: "Which sentence contains a dangling modifier?",
    options: [
      "While walking in the park, the dog chased a squirrel",
      "Walking in the park, the dog chased a squirrel",
      "The dog, while walking in the park, chased a squirrel",
      "The dog chased a squirrel while walking in the park"
    ],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "hard"
  },
  {
    id: 33,
    question: "What is the correct punctuation for this sentence: 'The report due tomorrow is critical'?",
    options: [
      "The report due tomorrow is critical",
      "The report, due tomorrow, is critical",
      "The report due tomorrow, is critical",
      "The report due tomorrow is, critical"
    ],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "hard"
  }
];

export function getRandomProblems(count = 3, difficulty = 'medium', domain = null) {
  // Filter problems by difficulty and domain if specified
  let filtered = problems.filter(problem => {
    return (!difficulty || problem.difficulty === difficulty) &&
           (!domain || problem.domain === domain);
  });

  // If no problems match, fall back to all problems
  if (filtered.length === 0) {
    filtered = problems;
  }

  // Shuffle and pick random problems
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function getProblemById(id) {
  return problems.find(problem => problem.id === id);
}

export default problems;
