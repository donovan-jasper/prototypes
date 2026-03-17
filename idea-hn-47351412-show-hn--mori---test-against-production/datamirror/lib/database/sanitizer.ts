import { faker } from '@faker-js/faker';

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
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    if (isEmail(key)) {
      return sanitizeEmail(value);
    }

    if (isPhone(key)) {
      return sanitizePhone(value);
    }

    if (isAddress(key)) {
      return sanitizeAddress(value);
    }

    if (isName(key)) {
      return sanitizeName(value);
    }

    if (isCreditCard(key)) {
      return sanitizeCreditCard(value);
    }
  }

  return value;
}

function isEmail(key) {
  const emailKeywords = ['email', 'mail', 'e_mail', 'e-mail'];
  return emailKeywords.some((keyword) => key.toLowerCase().includes(keyword));
}

function isPhone(key) {
  const phoneKeywords = ['phone', 'mobile', 'tel', 'telephone', 'fax'];
  return phoneKeywords.some((keyword) => key.toLowerCase().includes(keyword));
}

function isAddress(key) {
  const addressKeywords = ['address', 'street', 'city', 'state', 'zip', 'postal', 'country'];
  return addressKeywords.some((keyword) => key.toLowerCase().includes(keyword));
}

function isName(key) {
  const nameKeywords = ['name', 'first_name', 'last_name', 'full_name', 'username'];
  return nameKeywords.some((keyword) => key.toLowerCase().includes(keyword));
}

function isCreditCard(key) {
  const creditCardKeywords = ['card', 'credit_card', 'cc_number', 'card_number'];
  return creditCardKeywords.some((keyword) => key.toLowerCase().includes(keyword));
}

function sanitizeEmail(email) {
  try {
    const [localPart, domain] = email.split('@');
    if (!domain) return email; // Not a valid email, leave as is

    // Preserve domain but randomize local part
    const randomLocalPart = faker.internet.userName().toLowerCase();
    return `${randomLocalPart}@${domain}`;
  } catch (e) {
    console.error('Error sanitizing email:', e);
    return email;
  }
}

function sanitizePhone(phone) {
  try {
    // Keep the country code and area code, mask the rest
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) return phone; // Not a valid phone number

    const countryCode = digits.substring(0, digits.length - 7);
    const areaCode = digits.substring(digits.length - 7, digits.length - 4);
    const masked = digits.substring(digits.length - 4).replace(/\d/g, 'X');

    return `+${countryCode}-${areaCode}-${masked}`;
  } catch (e) {
    console.error('Error sanitizing phone:', e);
    return phone;
  }
}

function sanitizeAddress(address) {
  try {
    // Use a generic address format
    const street = faker.location.streetAddress();
    const city = faker.location.city();
    const state = faker.location.state();
    const zip = faker.location.zipCode();
    const country = faker.location.country();

    return `${street}, ${city}, ${state} ${zip}, ${country}`;
  } catch (e) {
    console.error('Error sanitizing address:', e);
    return address;
  }
}

function sanitizeName(name) {
  try {
    // Generate a realistic but fake name
    return faker.person.fullName();
  } catch (e) {
    console.error('Error sanitizing name:', e);
    return name;
  }
}

function sanitizeCreditCard(cardNumber) {
  try {
    // Keep the last 4 digits, mask the rest
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 4) return cardNumber;

    const masked = digits.substring(0, digits.length - 4).replace(/\d/g, 'X');
    const last4 = digits.substring(digits.length - 4);

    return `${masked}${last4}`;
  } catch (e) {
    console.error('Error sanitizing credit card:', e);
    return cardNumber;
  }
}
