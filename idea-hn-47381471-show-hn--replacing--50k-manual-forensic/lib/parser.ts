import { parse, isValid, format } from 'date-fns';

export interface TransactionData {
  date: Date;
  amount: number;
  payee: string;
}

export const extractTransaction = (ocrText: string): TransactionData | null => {
  if (!ocrText || typeof ocrText !== 'string') {
    return null;
  }

  // Normalize text (remove extra spaces, newlines)
  const normalizedText = ocrText.replace(/\s+/g, ' ').trim();

  // Extract payee (first line or line containing company name)
  let payee = '';
  const payeeLines = normalizedText.split('\n').slice(0, 3);
  for (const line of payeeLines) {
    if (line.length > 3 && !line.match(/^\d/)) {
      payee = line.trim();
      break;
    }
  }

  // Extract date (look for common date patterns)
  let date: Date | null = null;
  const datePatterns = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/g, // DD/MM/YYYY or MM/DD/YYYY
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/g,   // YYYY/MM/DD
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{2,4})/i, // Month DD, YYYY
  ];

  for (const pattern of datePatterns) {
    const matches = [...normalizedText.matchAll(pattern)];
    if (matches.length > 0) {
      const [_, day, month, year] = matches[0];
      let parsedDate;

      // Try different date formats
      if (day && month && year) {
        // Try MM/DD/YYYY first
        parsedDate = parse(`${month}/${day}/${year}`, 'MM/dd/yyyy', new Date());

        if (!isValid(parsedDate)) {
          // Try DD/MM/YYYY
          parsedDate = parse(`${day}/${month}/${year}`, 'dd/MM/yyyy', new Date());
        }

        if (!isValid(parsedDate)) {
          // Try Month DD, YYYY
          parsedDate = parse(`${month} ${day}, ${year}`, 'MMMM d, yyyy', new Date());
        }

        if (isValid(parsedDate)) {
          date = parsedDate;
          break;
        }
      }
    }
  }

  // If no date found, try to find a date in the last 3 lines
  if (!date) {
    const lastLines = normalizedText.split('\n').slice(-3).join(' ');
    for (const pattern of datePatterns) {
      const matches = [...lastLines.matchAll(pattern)];
      if (matches.length > 0) {
        const [_, day, month, year] = matches[0];
        let parsedDate;

        if (day && month && year) {
          parsedDate = parse(`${month}/${day}/${year}`, 'MM/dd/yyyy', new Date());

          if (!isValid(parsedDate)) {
            parsedDate = parse(`${day}/${month}/${year}`, 'dd/MM/yyyy', new Date());
          }

          if (!isValid(parsedDate)) {
            parsedDate = parse(`${month} ${day}, ${year}`, 'MMMM d, yyyy', new Date());
          }

          if (isValid(parsedDate)) {
            date = parsedDate;
            break;
          }
        }
      }
    }
  }

  // Extract amount (look for dollar amounts)
  let amount: number | null = null;
  const amountPatterns = [
    /\$?\s*([\d,]+\.\d{2})/g, // $123.45 or 123.45
    /\(?\$?\s*([\d,]+\.\d{2})\)?/g, // ($123.45) for negatives
  ];

  for (const pattern of amountPatterns) {
    const matches = [...normalizedText.matchAll(pattern)];
    if (matches.length > 0) {
      // Get the last match (most likely the total)
      const amountStr = matches[matches.length - 1][1];
      const parsedAmount = parseFloat(amountStr.replace(/,/g, ''));

      if (!isNaN(parsedAmount)) {
        amount = parsedAmount;
        break;
      }
    }
  }

  // If no amount found, look for "total" or "amount due" in the last few lines
  if (!amount) {
    const lastLines = normalizedText.split('\n').slice(-5).join(' ');
    const totalMatch = lastLines.match(/(?:total|amount due|balance due|grand total)\s*[\:\=]?\s*\$?\s*([\d,]+\.\d{2})/i);
    if (totalMatch) {
      const amountStr = totalMatch[1];
      const parsedAmount = parseFloat(amountStr.replace(/,/g, ''));
      if (!isNaN(parsedAmount)) {
        amount = parsedAmount;
      }
    }
  }

  // If we found both date and amount, return the transaction
  if (date && amount !== null && payee) {
    return {
      date,
      amount,
      payee,
    };
  }

  // If we found amount but not date, try to find date in the last few lines
  if (amount !== null && !date) {
    const lastLines = normalizedText.split('\n').slice(-3).join(' ');
    for (const pattern of datePatterns) {
      const matches = [...lastLines.matchAll(pattern)];
      if (matches.length > 0) {
        const [_, day, month, year] = matches[0];
        let parsedDate;

        if (day && month && year) {
          parsedDate = parse(`${month}/${day}/${year}`, 'MM/dd/yyyy', new Date());

          if (!isValid(parsedDate)) {
            parsedDate = parse(`${day}/${month}/${year}`, 'dd/MM/yyyy', new Date());
          }

          if (!isValid(parsedDate)) {
            parsedDate = parse(`${month} ${day}, ${year}`, 'MMMM d, yyyy', new Date());
          }

          if (isValid(parsedDate)) {
            date = parsedDate;
            break;
          }
        }
      }
    }

    if (date && payee) {
      return {
        date,
        amount,
        payee,
      };
    }
  }

  // If we found date but not amount, try to find amount in the last few lines
  if (date && amount === null) {
    const lastLines = normalizedText.split('\n').slice(-5).join(' ');
    for (const pattern of amountPatterns) {
      const matches = [...lastLines.matchAll(pattern)];
      if (matches.length > 0) {
        const amountStr = matches[matches.length - 1][1];
        const parsedAmount = parseFloat(amountStr.replace(/,/g, ''));

        if (!isNaN(parsedAmount)) {
          amount = parsedAmount;
          break;
        }
      }
    }

    if (amount !== null && payee) {
      return {
        date,
        amount,
        payee,
      };
    }
  }

  // If we found payee but not date or amount, try to find both in the text
  if (payee && !date && amount === null) {
    // Try to find date and amount in the same line
    const combinedPattern = /(?:date|date:|date\:)\s*([\d\/\-\.]+).*?(?:total|amount|balance)\s*\$?\s*([\d,]+\.\d{2})/i;
    const combinedMatch = normalizedText.match(combinedPattern);

    if (combinedMatch) {
      const [_, dateStr, amountStr] = combinedMatch;

      // Parse date
      let parsedDate = parse(dateStr, 'MM/dd/yyyy', new Date());
      if (!isValid(parsedDate)) {
        parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date());
      }

      // Parse amount
      const parsedAmount = parseFloat(amountStr.replace(/,/g, ''));

      if (isValid(parsedDate) && !isNaN(parsedAmount)) {
        return {
          date: parsedDate,
          amount: parsedAmount,
          payee,
        };
      }
    }
  }

  // If we couldn't extract all required fields, return null
  return null;
};
