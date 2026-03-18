import { getDatabase } from './database';

const CATEGORY_KEYWORDS = {
  'Food & Dining': [
    'restaurant', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast', 'food', 'pizza',
    'burger', 'sushi', 'starbucks', 'mcdonalds', 'subway', 'chipotle', 'dominos',
    'grocery', 'supermarket', 'whole foods', 'trader joes', 'safeway', 'kroger',
    'meal', 'eat', 'dining', 'kitchen', 'snack', 'delivery', 'ubereats', 'doordash',
    'grubhub', 'postmates', 'takeout', 'fastfood'
  ],
  'Transportation': [
    'uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'metro', 'subway', 'bus',
    'train', 'flight', 'airline', 'car', 'vehicle', 'transport', 'toll', 'transit',
    'shell', 'chevron', 'exxon', 'bp', 'mobil', 'ride', 'trip', 'travel', 'commute'
  ],
  'Shopping': [
    'amazon', 'walmart', 'target', 'ebay', 'shop', 'store', 'mall', 'retail',
    'clothing', 'clothes', 'shoes', 'fashion', 'electronics', 'best buy', 'apple store',
    'purchase', 'buy', 'order', 'online', 'zara', 'h&m', 'nike', 'adidas'
  ],
  'Bills & Utilities': [
    'electric', 'electricity', 'water', 'gas bill', 'utility', 'internet', 'phone',
    'mobile', 'verizon', 'at&t', 't-mobile', 'sprint', 'comcast', 'xfinity',
    'rent', 'mortgage', 'insurance', 'bill', 'payment', 'subscription'
  ],
  'Entertainment': [
    'netflix', 'hulu', 'spotify', 'disney', 'hbo', 'amazon prime', 'youtube',
    'movie', 'cinema', 'theater', 'concert', 'game', 'gaming', 'playstation',
    'xbox', 'nintendo', 'steam', 'entertainment', 'music', 'streaming', 'show',
    'ticket', 'event', 'amusement', 'park', 'zoo', 'museum'
  ],
  'Healthcare': [
    'doctor', 'hospital', 'pharmacy', 'medicine', 'medical', 'health', 'clinic',
    'dentist', 'dental', 'prescription', 'cvs', 'walgreens', 'rite aid', 'drug',
    'therapy', 'treatment', 'checkup', 'appointment', 'urgent care'
  ],
  'Personal Care': [
    'salon', 'haircut', 'barber', 'spa', 'massage', 'gym', 'fitness', 'yoga',
    'beauty', 'cosmetics', 'makeup', 'skincare', 'grooming', 'personal', 'care',
    'wellness', 'planet fitness', 'la fitness', 'equinox', 'sephora', 'ulta'
  ]
};

export async function categorizeExpense(description) {
  if (!description || typeof description !== 'string') {
    return { category: 'Other', confidence: 0, source: 'default' };
  }

  const lowerDescription = description.toLowerCase().trim();
  const db = getDatabase();

  // Check user corrections first
  const corrections = await db.getAllAsync(
    'SELECT user_chosen_category, frequency FROM category_corrections WHERE description_pattern = ? ORDER BY frequency DESC LIMIT 1',
    [lowerDescription]
  );

  if (corrections.length > 0) {
    return {
      category: corrections[0].user_chosen_category,
      confidence: Math.min(0.7 + (corrections[0].frequency * 0.05), 0.95),
      source: 'learned'
    };
  }

  // Check for partial matches in corrections
  const partialCorrections = await db.getAllAsync(
    'SELECT description_pattern, user_chosen_category, frequency FROM category_corrections ORDER BY frequency DESC'
  );

  for (const correction of partialCorrections) {
    const pattern = correction.description_pattern.toLowerCase();
    if (lowerDescription.includes(pattern) || pattern.includes(lowerDescription)) {
      return {
        category: correction.user_chosen_category,
        confidence: Math.min(0.6 + (correction.frequency * 0.03), 0.85),
        source: 'learned'
      };
    }
  }

  // Fall back to keyword matching
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerDescription.includes(keyword)) {
        return {
          category,
          confidence: 0.5,
          source: 'keyword'
        };
      }
    }
  }

  return { category: 'Other', confidence: 0.3, source: 'default' };
}

export async function recordCategoryCorrection(description, userChosenCategory) {
  if (!description || !userChosenCategory) return;

  const db = getDatabase();
  const lowerDescription = description.toLowerCase().trim();
  const now = new Date().toISOString();

  // Check if correction already exists
  const existing = await db.getAllAsync(
    'SELECT id, frequency FROM category_corrections WHERE description_pattern = ? AND user_chosen_category = ?',
    [lowerDescription, userChosenCategory]
  );

  if (existing.length > 0) {
    // Increment frequency
    await db.runAsync(
      'UPDATE category_corrections SET frequency = frequency + 1, updated_at = ? WHERE id = ?',
      [now, existing[0].id]
    );
  } else {
    // Insert new correction
    await db.runAsync(
      'INSERT INTO category_corrections (description_pattern, user_chosen_category, frequency, created_at, updated_at) VALUES (?, ?, 1, ?, ?)',
      [lowerDescription, userChosenCategory, now, now]
    );
  }
}

export function getCategories() {
  return [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Bills & Utilities',
    'Entertainment',
    'Healthcare',
    'Personal Care',
    'Other'
  ];
}
