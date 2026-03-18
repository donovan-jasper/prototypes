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

export function categorizeExpense(description) {
  if (!description || typeof description !== 'string') {
    return 'Other';
  }

  const lowerDescription = description.toLowerCase().trim();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerDescription.includes(keyword)) {
        return category;
      }
    }
  }

  return 'Other';
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
