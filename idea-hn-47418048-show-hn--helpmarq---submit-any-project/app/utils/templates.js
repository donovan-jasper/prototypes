export const TEMPLATES = {
  'Logo Review': [
    { id: '1', question: 'Is the logo clear and readable?', type: 'rating' },
    { id: '2', question: 'Does the logo match the brand personality?', type: 'rating' },
    { id: '3', question: 'What would you improve about the logo?', type: 'text' }
  ],
  'Pitch Deck': [
    { id: '1', question: 'Is the problem clearly stated?', type: 'rating' },
    { id: '2', question: 'Are the solutions compelling?', type: 'rating' },
    { id: '3', question: 'What questions do you have about the business model?', type: 'text' }
  ],
  'Portfolio Review': [
    { id: '1', question: 'Does the portfolio showcase your skills effectively?', type: 'rating' },
    { id: '2', question: 'What projects stand out to you?', type: 'text' },
    { id: '3', question: 'How would you describe your work style?', type: 'text' }
  ]
};

export const getTemplateQuestions = (templateName) => {
  return TEMPLATES[templateName] || [];
};
