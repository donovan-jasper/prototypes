export const extractData = async (text: string): Promise<{ entities: Array<{ type: string; value: string }> }> => {
  // Mock implementation - in a real app this would call an LLM API
  const mockEntities = [
    { type: 'email', value: 'john@example.com' },
    { type: 'date', value: '2023-12-15' },
    { type: 'phone', value: '(555) 123-4567' },
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simple pattern matching for demo purposes
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const dateRegex = /\b\d{4}-\d{2}-\d{2}\b/g;
  const phoneRegex = /\b\(\d{3}\) \d{3}-\d{4}\b/g;

  const foundEntities = [
    ...text.matchAll(emailRegex).map(match => ({ type: 'email', value: match[0] })),
    ...text.matchAll(dateRegex).map(match => ({ type: 'date', value: match[0] })),
    ...text.matchAll(phoneRegex).map(match => ({ type: 'phone', value: match[0] })),
  ];

  return {
    entities: foundEntities.length > 0 ? foundEntities : mockEntities
  };
};
