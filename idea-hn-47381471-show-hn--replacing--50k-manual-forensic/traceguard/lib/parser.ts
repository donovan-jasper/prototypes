import { parse } from 'date-fns';

export const extractTransaction = (ocrText: string) => {
  // Extract date using multiple patterns
  const datePatterns = [
    /(\d{2})\/(\d{2})\/(\d{4})/, // MM/DD/YYYY
    /(\d{4})-(\d{2})-(\d{2})/,    // YYYY-MM-DD
    /(\w+)\s(\d{1,2}),\s(\d{4})/  // Month DD, YYYY
  ];

  let date = null;
  for (const pattern of datePatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      if (pattern === datePatterns[2]) {
        // Handle Month DD, YYYY format
        date = parse(`${match[2]} ${match[1]} ${match[3]}`, 'd MMMM yyyy', new Date());
      } else {
        date = new Date(match[0]);
      }
      break;
    }
  }

  // Extract amount using multiple patterns
  const amountPatterns = [
    /\$(\d+\.\d{2})/,       // $X.XX
    /(\d+\.\d{2})/,         // X.XX
    /\(\$(\d+\.\d{2})\)/    // ($X.XX) for negatives
  ];

  let amount = null;
  for (const pattern of amountPatterns) {
    const match = ocrText.match(pattern);
    if (match) {
      amount = parseFloat(match[1]);
      if (pattern === amountPatterns[2]) {
        amount *= -1; // Negative amount
      }
      break;
    }
  }

  // Extract payee (first line of text)
  const payee = ocrText.split('\n')[0].trim();

  if (date && amount && payee) {
    return {
      date,
      amount,
      payee,
      type: amount >= 0 ? 'deposit' : 'withdrawal'
    };
  }

  return null;
};
