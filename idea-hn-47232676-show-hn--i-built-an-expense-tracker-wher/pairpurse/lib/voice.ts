export const parseVoiceInput = (input) => {
  // Parse voice input into expense data
  const amountMatch = input.match(/\$?(\d+\.?\d*)/);
  const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

  const descriptionMatch = input.match(/(.+?)(?=\$|\d)/);
  const description = descriptionMatch ? descriptionMatch[1].trim() : '';

  const category = input.includes('coffee') || input.includes('dinner') ? 'Food' :
                  input.includes('uber') || input.includes('taxi') ? 'Transport' : 'Other';

  return {
    description,
    amount,
    category,
    splitType: 'even',
  };
};
