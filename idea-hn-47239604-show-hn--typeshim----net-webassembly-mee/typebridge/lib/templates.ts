const templates = [
  {
    id: '1',
    name: 'Basic Calculator',
    description: 'A simple calculator app',
    code: '// Basic calculator code',
    category: 'Tools',
    isPremium: false,
  },
  // Add more templates
];

export const getTemplates = (isPremium) => {
  return templates.filter(template => !template.isPremium || isPremium);
};

export const applyTemplate = async (projectId, templateId) => {
  // Implementation for applying a template to a project
};
