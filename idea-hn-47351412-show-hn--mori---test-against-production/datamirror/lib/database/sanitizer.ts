export async function sanitizeData(data) {
  const sanitizedData = [];

  for (const table of data) {
    const sanitizedRows = table.rows.map((row) => {
      const sanitizedRow = {};
      for (const [key, value] of Object.entries(row)) {
        sanitizedRow[key] = sanitizeValue(key, value);
      }
      return sanitizedRow;
    });

    sanitizedData.push({ name: table.name, rows: sanitizedRows });
  }

  return sanitizedData;
}

function sanitizeValue(key, value) {
  if (typeof value !== 'string') {
    return value;
  }

  if (isEmail(key)) {
    return sanitizeEmail(value);
  }

  if (isPhone(key)) {
    return sanitizePhone(value);
  }

  if (isAddress(key)) {
    return sanitizeAddress(value);
  }

  return value;
}

function isEmail(key) {
  const emailKeywords = ['email', 'mail'];
  return emailKeywords.some((keyword) => key.toLowerCase().includes(keyword));
}

function isPhone(key) {
  const phoneKeywords = ['phone', 'mobile', 'tel'];
  return phoneKeywords.some((keyword) => key.toLowerCase().includes(keyword));
}

function isAddress(key) {
  const addressKeywords = ['address', 'street', 'city', 'state', 'zip', 'postal'];
  return addressKeywords.some((keyword) => key.toLowerCase().includes(keyword));
}

function sanitizeEmail(email) {
  const [localPart, domain] = email.split('@');
  const randomLocalPart = Math.random().toString(36).substring(2, 8);
  return `${randomLocalPart}@${domain}`;
}

function sanitizePhone(phone) {
  return phone.replace(/\d(?=\d{4})/g, 'X');
}

function sanitizeAddress(address) {
  return '123 Main St, Anytown, USA';
}
