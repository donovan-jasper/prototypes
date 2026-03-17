// Logic Problems
const logicProblems = [
  // Easy
  {
    question: "If all roses are flowers and some flowers fade quickly, which statement must be true?",
    options: [
      "All roses fade quickly",
      "Some roses are flowers",
      "No roses fade quickly",
      "All flowers are roses"
    ],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "easy"
  },
  {
    question: "A train leaves at 3 PM and arrives at 7 PM. How long was the journey?",
    options: ["3 hours", "4 hours", "5 hours", "6 hours"],
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
    difficulty: "easy"
  },
  // Medium
  {
    question: "In a race, you overtake the person in second place. What position are you in now?",
    options: ["First", "Second", "Third", "Fourth"],
    correctAnswer: 1,
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
  {
    question: "A bat and ball cost $1.10 total. The bat costs $1 more than the ball. How much does the ball cost?",
    options: ["$0.10", "$0.05", "$0.15", "$0.20"],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "medium"
  },
  {
    question: "Five people can build 5 houses in 5 days. How many days would it take 10 people to build 10 houses?",
    options: ["5 days", "10 days", "2.5 days", "15 days"],
    correctAnswer: 0,
    domain: "logic",
    difficulty: "medium"
  },
  {
    question: "If no A is B, and all C is A, what can we conclude about C and B?",
    options: [
      "Some C is B",
      "No C is B",
      "All C is B",
      "Cannot determine"
    ],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "medium"
  },
  // Hard
  {
    question: "Three switches outside a room control three bulbs inside. You can flip switches but enter only once. How do you determine which switch controls which bulb?",
    options: [
      "Flip all switches and check",
      "Flip one, wait, flip another, then check temperature and light",
      "Flip switches in sequence",
      "It's impossible"
    ],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "hard"
  },
  {
    question: "You have 12 balls, one is slightly heavier. Using a balance scale only 3 times, how do you find it?",
    options: [
      "Weigh them one by one",
      "Divide into groups of 4, then narrow down",
      "Divide into groups of 6",
      "It requires more than 3 weighings"
    ],
    correctAnswer: 1,
    domain: "logic",
    difficulty: "hard"
  },
  {
    question: "A man says 'I am lying.' Is this statement true or false?",
    options: [
      "True",
      "False",
      "It's a paradox",
      "Depends on context"
    ],
    correctAnswer: 2,
    domain: "logic",
    difficulty: "hard"
  },
  {
    question: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
    options: ["5 minutes", "100 minutes", "20 minutes", "10 minutes"],
    correctAnswer: 0,
    domain: "logic",
    difficulty: "hard"
  }
];

// Math Problems
const mathProblems = [
  // Easy
  {
    question: "What is 15% of 200?",
    options: ["25", "30", "35", "40"],
    correctAnswer: 1,
    domain: "math",
    difficulty: "easy"
  },
  {
    question: "If x + 5 = 12, what is x?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "easy"
  },
  {
    question: "What is the area of a rectangle with length 8 and width 5?",
    options: ["13", "26", "40", "45"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "easy"
  },
  {
    question: "What is 3² + 4²?",
    options: ["25", "49", "12", "14"],
    correctAnswer: 0,
    domain: "math",
    difficulty: "easy"
  },
  {
    question: "If a shirt costs $40 and is on sale for 25% off, what is the sale price?",
    options: ["$30", "$35", "$25", "$20"],
    correctAnswer: 0,
    domain: "math",
    difficulty: "easy"
  },
  // Medium
  {
    question: "If 3x - 7 = 14, what is x?",
    options: ["5", "6", "7", "8"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "medium"
  },
  {
    question: "What is the next number in the sequence: 2, 6, 12, 20, 30, ?",
    options: ["38", "40", "42", "44"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "medium"
  },
  {
    question: "A car travels 240 miles in 4 hours. What is its average speed in mph?",
    options: ["50", "55", "60", "65"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "medium"
  },
  {
    question: "If the probability of rain is 0.3, what is the probability it won't rain?",
    options: ["0.3", "0.5", "0.7", "1.0"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "medium"
  },
  {
    question: "What is 20% of 25% of 400?",
    options: ["15", "20", "25", "30"],
    correctAnswer: 1,
    domain: "math",
    difficulty: "medium"
  },
  // Hard
  {
    question: "If f(x) = 2x + 3 and g(x) = x², what is f(g(2))?",
    options: ["11", "13", "14", "19"],
    correctAnswer: 0,
    domain: "math",
    difficulty: "hard"
  },
  {
    question: "A number is increased by 20% and then decreased by 20%. What is the net change?",
    options: ["0%", "-4%", "+4%", "-2%"],
    correctAnswer: 1,
    domain: "math",
    difficulty: "hard"
  },
  {
    question: "What is the sum of all integers from 1 to 100?",
    options: ["5000", "5050", "5100", "5500"],
    correctAnswer: 1,
    domain: "math",
    difficulty: "hard"
  },
  {
    question: "If log₂(x) = 5, what is x?",
    options: ["10", "25", "32", "64"],
    correctAnswer: 2,
    domain: "math",
    difficulty: "hard"
  }
];

// Verbal Problems
const verbalProblems = [
  // Easy
  {
    question: "Which word is most similar to 'happy'?",
    options: ["Sad", "Joyful", "Angry", "Tired"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "easy"
  },
  {
    question: "Complete the analogy: Hot is to Cold as Day is to ___",
    options: ["Sun", "Night", "Light", "Morning"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "easy"
  },
  {
    question: "Which word does NOT belong: Apple, Banana, Carrot, Orange",
    options: ["Apple", "Banana", "Carrot", "Orange"],
    correctAnswer: 2,
    domain: "verbal",
    difficulty: "easy"
  },
  {
    question: "What is the opposite of 'expand'?",
    options: ["Grow", "Contract", "Increase", "Enlarge"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "easy"
  },
  {
    question: "Which word means 'to make better'?",
    options: ["Worsen", "Improve", "Maintain", "Destroy"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "easy"
  },
  // Medium
  {
    question: "Meticulous is to Careless as Generous is to ___",
    options: ["Kind", "Stingy", "Wealthy", "Poor"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "medium"
  },
  {
    question: "Which word best describes someone who is 'eloquent'?",
    options: ["Silent", "Articulate", "Confused", "Shy"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "medium"
  },
  {
    question: "Ephemeral most nearly means:",
    options: ["Eternal", "Temporary", "Beautiful", "Mysterious"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "medium"
  },
  {
    question: "Book is to Library as Art is to ___",
    options: ["Paint", "Museum", "Canvas", "Artist"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "medium"
  },
  {
    question: "Which word is most opposite to 'ambiguous'?",
    options: ["Clear", "Vague", "Uncertain", "Doubtful"],
    correctAnswer: 0,
    domain: "verbal",
    difficulty: "medium"
  },
  // Hard
  {
    question: "Obfuscate most nearly means:",
    options: ["Clarify", "Confuse", "Simplify", "Explain"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "hard"
  },
  {
    question: "Cacophony is to Sound as Pandemonium is to ___",
    options: ["Peace", "Chaos", "Music", "Silence"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "hard"
  },
  {
    question: "Which word best describes 'perspicacious'?",
    options: ["Confused", "Insightful", "Sweaty", "Obvious"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "hard"
  },
  {
    question: "Iconoclast most nearly means:",
    options: ["Traditionalist", "Rebel", "Artist", "Follower"],
    correctAnswer: 1,
    domain: "verbal",
    difficulty: "hard"
  }
];

// Strategy Problems
const strategyProblems = [
  // Easy
  {
    question: "You have $100 to invest. Option A guarantees 5% return. Option B has 50% chance of 15% return or 50% chance of -5%. Which is safer?",
    options: ["Option A", "Option B", "Both equal", "Neither"],
    correctAnswer: 0,
    domain: "strategy",
    difficulty: "easy"
  },
  {
    question: "In a game, you can take 1, 2, or 3 coins per turn. There are 10 coins. You go first. What's your winning first move?",
    options: ["Take 1", "Take 2", "Take 3", "Doesn't matter"],
    correctAnswer: 0,
    domain: "strategy",
    difficulty: "easy"
  },
  {
    question: "You need to cross a bridge that takes 10 minutes. You have a torch that lasts 12 minutes. A friend can cross in 5 minutes. What's the optimal strategy?",
    options: [
      "Go alone",
      "Send friend first, then follow",
      "Go together",
      "Send friend back and forth"
    ],
    correctAnswer: 2,
    domain: "strategy",
    difficulty: "easy"
  },
  {
    question: "In rock-paper-scissors, your opponent has played rock 3 times in a row. What should you play?",
    options: [
      "Rock",
      "Paper",
      "Scissors",
      "It doesn't matter"
    ],
    correctAnswer: 3,
    domain: "strategy",
    difficulty: "easy"
  },
  // Medium
  {
    question: "You're managing a project with 3 tasks: A (2 days), B (3 days, requires A), C (1 day, independent). What's the minimum completion time?",
    options: ["4 days", "5 days", "6 days", "3 days"],
    correctAnswer: 1,
    domain: "strategy",
    difficulty: "medium"
  },
  {
    question: "In a negotiation, you value an item at $100. The seller values it at $60. What's the optimal outcome?",
    options: [
      "Pay $100",
      "Pay $60",
      "Pay between $60-$100",
      "Don't buy"
    ],
    correctAnswer: 2,
    domain: "strategy",
    difficulty: "medium"
  },
  {
    question: "You have 3 job offers: A ($80k, stable), B ($70k, high growth), C ($90k, risky). You're risk-averse. Which do you choose?",
    options: ["A", "B", "C", "Negotiate with all"],
    correctAnswer: 0,
    domain: "strategy",
    difficulty: "medium"
  },
  {
    question: "In a tournament, you can choose your opponent. You're ranked 3rd. Ranks 1, 2, 4, 5 remain. Who do you challenge?",
    options: ["Rank 1", "Rank 2", "Rank 4", "Rank 5"],
    correctAnswer: 1,
    domain: "strategy",
    difficulty: "medium"
  },
  {
    question: "You're allocating budget across 3 projects with diminishing returns. Which strategy maximizes total value?",
    options: [
      "All in one project",
      "Equal distribution",
      "Weighted by initial returns",
      "Focus on two projects"
    ],
    correctAnswer: 2,
    domain: "strategy",
    difficulty: "medium"
  },
  // Hard
  {
    question: "In the Prisoner's Dilemma (one round), what's the Nash equilibrium?",
    options: [
      "Both cooperate",
      "Both defect",
      "One cooperates, one defects",
      "No equilibrium"
    ],
    correctAnswer: 1,
    domain: "strategy",
    difficulty: "hard"
  },
  {
    question: "You're in a sealed-bid auction. Your valuation is $100. What's your optimal bid?",
    options: [
      "$100",
      "Less than $100",
      "More than $100",
      "Depends on others' bids"
    ],
    correctAnswer: 1,
    domain: "strategy",
    difficulty: "hard"
  },
  {
    question: "In a multi-stage game, you can invest now for future advantage or maximize current gains. Discount rate is high. What do you do?",
    options: [
      "Invest for future",
      "Maximize current gains",
      "Balance both",
      "Wait and see"
    ],
    correctAnswer: 1,
    domain: "strategy",
    difficulty: "hard"
  },
  {
    question: "You're designing a pricing strategy. Demand is elastic. Costs are fixed. What maximizes profit?",
    options: [
      "High price, low volume",
      "Low price, high volume",
      "Medium price",
      "Dynamic pricing"
    ],
    correctAnswer: 3,
    domain: "strategy",
    difficulty: "hard"
  }
];

const allProblems = [
  ...logicProblems,
  ...mathProblems,
  ...verbalProblems,
  ...strategyProblems
];

export function getRandomProblems(count = 3, difficulty = null) {
  let pool = allProblems;
  
  if (difficulty) {
    pool = allProblems.filter(p => p.difficulty === difficulty);
  }
  
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getProblemsByDomain(domain, count = 5) {
  const domainProblems = allProblems.filter(p => p.domain === domain);
  const shuffled = [...domainProblems].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getProblemsByDifficulty(difficulty) {
  return allProblems.filter(p => p.difficulty === difficulty);
}

export default allProblems;
