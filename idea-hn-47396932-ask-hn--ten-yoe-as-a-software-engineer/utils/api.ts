import { Question } from '../types';

const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'How to deploy a TensorFlow model on ESP32?',
    content: 'I need help with deploying a trained TensorFlow model to an ESP32 microcontroller. Any resources or examples would be appreciated.',
    author: 'AI_Enthusiast',
    upvotes: 15,
    isAnswered: true,
    createdAt: new Date('2023-05-15'),
  },
  {
    id: '2',
    title: 'Best Python libraries for embedded systems?',
    content: 'What are the most useful Python libraries for working with embedded systems development?',
    author: 'EmbeddedDev',
    upvotes: 8,
    isAnswered: false,
    createdAt: new Date('2023-05-18'),
  },
  {
    id: '3',
    title: 'How to optimize memory usage in TinyML models?',
    content: 'I\'m working on a TinyML project and need tips on optimizing memory usage for my neural network model.',
    author: 'ML_Practitioner',
    upvotes: 22,
    isAnswered: true,
    createdAt: new Date('2023-05-20'),
  },
];

export const getQuestions = async (): Promise<Question[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockQuestions;
};

export const submitQuestion = async (question: Omit<Question, 'id'>): Promise<Question> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Generate a new ID
  const newQuestion = {
    ...question,
    id: (mockQuestions.length + 1).toString(),
  };

  // Add to mock data
  mockQuestions.push(newQuestion);

  return newQuestion;
};
