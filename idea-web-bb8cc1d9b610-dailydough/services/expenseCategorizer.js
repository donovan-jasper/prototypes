import { getDatabase } from './database';

// Default categories
const DEFAULT_CATEGORIES = [
  'Food & Drink',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Personal',
  'Other'
];

// Simple keyword-based categorization
const KEYWORD_CATEGORIES = {
  'Food & Drink': ['restaurant', 'cafe', 'coffee', 'diner', 'fast food', 'groceries', 'starbucks', 'subway'],
  'Transportation': ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'toll', 'metro', 'train', 'bus'],
  'Shopping': ['amazon', 'walmart', 'target', 'best buy', 'mall', 'store', 'online shopping'],
  'Entertainment': ['movie', 'theater', 'concert', 'netflix', 'spotify', 'hulu', 'gym', 'fitness'],
  'Utilities': ['electric', 'water', 'internet', 'phone', 'cable', 'gas bill'],
  'Healthcare': ['doctor', 'hospital', 'pharmacy', 'dentist', 'medical', 'insurance'],
  'Travel': ['hotel', 'airbnb', 'flight', 'vacation', 'trip', 'holiday'],
  'Education': ['school', 'college', 'university', 'tuition', 'course', 'book'],
  'Personal': ['haircut', 'grooming', 'clothing', 'cosmetics', 'gift', 'donation']
};

// Get all available categories
export function getCategories() {
  return DEFAULT_CATEGORIES;
}

// Categorize an expense based on description
export async function categorizeExpense(description) {
  const db = getDatabase();
  const lowerDesc = description.toLowerCase();

  // First check if we have a learned pattern
  const learnedResult = await db.getFirstAsync(
    'SELECT user_chosen_category, frequency FROM category_corrections WHERE ? LIKE "%" || description_pattern || "%" ORDER BY frequency DESC LIMIT 1',
    [lowerDesc]
  );

  if (learnedResult) {
    return {
      category: learnedResult.user_chosen_category,
      confidence: Math.min(1, learnedResult.frequency * 0.1), // Confidence increases with frequency
      source: 'learned'
    };
  }

  // Fall back to keyword matching
  for (const [category, keywords] of Object.entries(KEYWORD_CATEGORIES)) {
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        return {
          category,
          confidence: 0.7, // Medium confidence for keyword matches
          source: 'keyword'
        };
      }
    }
  }

  // Default category if no match found
  return {
    category: 'Other',
    confidence: 0.3, // Low confidence for default category
    source: 'default'
  };
}

// Record a user's category correction to improve future predictions
export async function recordCategoryCorrection(description, userChosenCategory) {
  const db = getDatabase();
  const lowerDesc = description.toLowerCase();
  const now = new Date().toISOString();

  // Check if we already have a record for this pattern
  const existing = await db.getFirstAsync(
    'SELECT id, frequency FROM category_corrections WHERE description_pattern = ? AND user_chosen_category = ?',
    [lowerDesc, userChosenCategory]
  );

  if (existing) {
    // Update existing record
    await db.runAsync(
      'UPDATE category_corrections SET frequency = ?, updated_at = ? WHERE id = ?',
      [existing.frequency + 1, now, existing.id]
    );
  } else {
    // Create new record
    await db.runAsync(
      'INSERT INTO category_corrections (description_pattern, user_chosen_category, frequency, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [lowerDesc, userChosenCategory, 1, now, now]
    );
  }
}
