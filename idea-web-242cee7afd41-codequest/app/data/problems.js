import { shuffleArray } from '../utils/helpers';

// Problem structure:
// {
//   id: string,
//   domain: 'logic' | 'math' | 'verbal',
//   difficulty: 'easy' | 'medium' | 'hard',
//   question: string,
//   options: string[],
//   correctAnswer: number,
//   explanation?: string
// }

const logicProblems = [
  // Easy
  {
    id: 'logic-easy-1',
    domain: 'logic',
    difficulty: 'easy',
    question: 'If all Bloops are Razzies and all Razzies are Lazzies, then all Bloops are definitely Lazzies.',
    options: ['True', 'False', 'Sometimes', 'Never'],
    correctAnswer: 0,
    explanation: 'This follows from the transitive property of "all".'
  },
  {
    id: 'logic-easy-2',
    domain: 'logic',
    difficulty: 'easy',
    question: 'Which of the following is a valid syllogism?',
    options: [
      'All cats are mammals. Some mammals are dogs. Therefore, some cats are dogs.',
      'All birds can fly. Penguins are birds. Therefore, penguins can fly.',
      'No vegetables are fruits. All tomatoes are fruits. Therefore, no tomatoes are vegetables.',
      'Some fish are cold-blooded. All sharks are fish. Therefore, some sharks are cold-blooded.'
    ],
    correctAnswer: 3,
    explanation: 'This is a valid syllogism because it follows the structure of a categorical syllogism.'
  },

  // Medium
  {
    id: 'logic-medium-1',
    domain: 'logic',
    difficulty: 'medium',
    question: 'If P → Q is true and Q → R is true, then which of the following must be true?',
    options: [
      'P → R',
      'R → P',
      'P ↔ R',
      'None of the above'
    ],
    correctAnswer: 3,
    explanation: 'The truth of P → R depends on the truth values of P and R, which aren\'t specified.'
  },
  {
    id: 'logic-medium-2',
    domain: 'logic',
    difficulty: 'medium',
    question: 'Which of the following is logically equivalent to (P ∧ Q) ∨ (¬P ∧ R)?',
    options: [
      'P ↔ Q',
      'P ∨ (Q ∧ R)',
      '(P ∨ R) ∧ (¬P ∨ Q)',
      '¬(P ↔ Q)'
    ],
    correctAnswer: 2,
    explanation: 'This is the distributive property of logical OR over AND.'
  },

  // Hard
  {
    id: 'logic-hard-1',
    domain: 'logic',
    difficulty: 'hard',
    question: 'Which of the following is a tautology?',
    options: [
      '(P ∨ Q) → (P ∧ Q)',
      '(P ∧ Q) ∨ (¬P ∧ ¬Q)',
      'P ∨ (¬P ∧ Q)',
      '¬(P ↔ Q) ↔ (P ↔ ¬Q)'
    ],
    correctAnswer: 3,
    explanation: 'This is a tautology because it\'s always true regardless of the truth values of P and Q.'
  },
  {
    id: 'logic-hard-2',
    domain: 'logic',
    difficulty: 'hard',
    question: 'If the premises "All humans are mortal" and "Socrates is human" are true, what conclusion can be logically drawn?',
    options: [
      'Socrates is mortal',
      'All mortals are humans',
      'There exists a human who is mortal',
      'Socrates is the only mortal human'
    ],
    correctAnswer: 0,
    explanation: 'This follows directly from the premises using the law of detachment.'
  }
];

const mathProblems = [
  // Easy
  {
    id: 'math-easy-1',
    domain: 'math',
    difficulty: 'easy',
    question: 'What is 5 + 7 × 2?',
    options: ['19', '24', '14', '26'],
    correctAnswer: 1,
    explanation: 'Multiplication comes before addition in the order of operations.'
  },
  {
    id: 'math-easy-2',
    domain: 'math',
    difficulty: 'easy',
    question: 'What is the value of x in the equation 3x + 5 = 20?',
    options: ['5', '3', '7', '15'],
    correctAnswer: 1,
    explanation: 'Subtract 5 from both sides, then divide by 3.'
  },

  // Medium
  {
    id: 'math-medium-1',
    domain: 'math',
    difficulty: 'medium',
    question: 'What is the derivative of f(x) = 3x² + 2x - 5?',
    options: [
      '6x + 2',
      '3x + 2',
      '6x² + 2x',
      '6x + 2 - 5'
    ],
    correctAnswer: 0,
    explanation: 'Apply the power rule to each term.'
  },
  {
    id: 'math-medium-2',
    domain: 'math',
    difficulty: 'medium',
    question: 'What is the solution to the system of equations: y = 2x + 3 and 3x - y = 5?',
    options: [
      'x = 1, y = 5',
      'x = 2, y = 7',
      'x = 1, y = 7',
      'x = 2, y = 5'
    ],
    correctAnswer: 0,
    explanation: 'Substitute y from the first equation into the second equation.'
  },

  // Hard
  {
    id: 'math-hard-1',
    domain: 'math',
    difficulty: 'hard',
    question: 'What is the limit as x approaches infinity of (3x² + 2x + 1)/(2x² - x + 4)?',
    options: ['1.5', '0.5', '1', 'Infinity'],
    correctAnswer: 0,
    explanation: 'Divide numerator and denominator by x² and take the limit.'
  },
  {
    id: 'math-hard-2',
    domain: 'math',
    difficulty: 'hard',
    question: 'What is the value of the integral ∫ from 0 to π of sin(x) dx?',
    options: ['0', '1', '2', '-1'],
    correctAnswer: 1,
    explanation: 'The antiderivative of sin(x) is -cos(x).'
  }
];

const verbalProblems = [
  // Easy
  {
    id: 'verbal-easy-1',
    domain: 'verbal',
    difficulty: 'easy',
    question: 'Which word is most similar in meaning to "ubiquitous"?',
    options: ['Rare', 'Common', 'Unique', 'Scarce'],
    correctAnswer: 1,
    explanation: '"Ubiquitous" means present everywhere, so "common" is the closest synonym.'
  },
  {
    id: 'verbal-easy-2',
    domain: 'verbal',
    difficulty: 'easy',
    question: 'Which sentence is grammatically correct?',
    options: [
      'She don\'t like apples.',
      'She doesn\'t like apples.',
      'She don\'t likes apples.',
      'She doesn\'t likes apples.'
    ],
    correctAnswer: 1,
    explanation: 'The correct contraction is "doesn\'t" for the third person singular.'
  },

  // Medium
  {
    id: 'verbal-medium-1',
    domain: 'verbal',
    difficulty: 'medium',
    question: 'Which of the following is an example of a metaphor?',
    options: [
      'The room was filled with a thick fog.',
      'The room was filled with a thick mist.',
      'The room was filled with a thick cloud.',
      'The room was filled with a thick smoke.'
    ],
    correctAnswer: 0,
    explanation: 'A metaphor compares two unlike things without using "like" or "as".'
  },
  {
    id: 'verbal-medium-2',
    domain: 'verbal',
    difficulty: 'medium',
    question: 'Which word is most opposite in meaning to "benevolent"?',
    options: ['Kind', 'Generous', 'Malevolent', 'Charitable'],
    correctAnswer: 2,
    explanation: '"Benevolent" means well-meaning, so "malevolent" means having or showing a wish to do harm.'
  },

  // Hard
  {
    id: 'verbal-hard-1',
    domain: 'verbal',
    difficulty: 'hard',
    question: 'Which of the following is an example of a pun?',
    options: [
      'Time flies like an arrow.',
      'The pen is mightier than the sword.',
      'A picture is worth a thousand words.',
      'Actions speak louder than words.'
    ],
    correctAnswer: 0,
    explanation: 'A pun plays on multiple meanings of a word.'
  },
  {
    id: 'verbal-hard-2',
    domain: 'verbal',
    difficulty: 'hard',
    question: 'Which of the following is an example of a paradox?',
    options: [
      'The grass is always greener on the other side.',
      'You can\'t have your cake and eat it too.',
      'A bird in the hand is worth two in the bush.',
      'The early bird catches the worm.'
    ],
    correctAnswer: 1,
    explanation: 'A paradox is a statement that seems contradictory but may be true when examined closely.'
  }
];

const allProblems = [...logicProblems, ...mathProblems, ...verbalProblems];

export function getRandomProblems(count = 3, difficulty = 'medium', domain = null) {
  let filteredProblems = allProblems.filter(problem => problem.difficulty === difficulty);

  if (domain) {
    filteredProblems = filteredProblems.filter(problem => problem.domain === domain);
  }

  return shuffleArray(filteredProblems).slice(0, count);
}

export function getProblemById(id) {
  return allProblems.find(problem => problem.id === id);
}

export function getProblemsByDomain(domain, count = 3) {
  const filteredProblems = allProblems.filter(problem => problem.domain === domain);
  return shuffleArray(filteredProblems).slice(0, count);
}
