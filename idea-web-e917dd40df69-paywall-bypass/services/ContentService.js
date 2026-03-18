import * as SQLite from 'expo-sqlite';
import axios from 'axios';

let db = null;

const initDatabase = async () => {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('librio.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS articles (
      url TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT,
      source TEXT,
      publishedDate TEXT,
      fetchedAt TEXT NOT NULL,
      imageUrl TEXT,
      category TEXT
    );
    
    CREATE TABLE IF NOT EXISTS user_preferences (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
    CREATE INDEX IF NOT EXISTS idx_articles_fetchedAt ON articles(fetchedAt DESC);
  `);
  
  const categories = [
    'Technology', 'Business', 'Politics', 'Science', 
    'Health', 'Entertainment', 'Sports', 'World News'
  ];
  
  for (const category of categories) {
    await db.runAsync(
      'INSERT OR IGNORE INTO user_preferences (key, value) VALUES (?, ?)',
      [`category_${category}`, 'false']
    );
  }
  
  return db;
};

const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return 'Unknown';
  }
};

const categorizeArticle = (title, content, url) => {
  const text = `${title} ${content} ${url}`.toLowerCase();
  
  const categoryKeywords = {
    'Technology': ['tech', 'software', 'ai', 'computer', 'digital', 'app', 'startup', 'silicon valley', 'coding', 'programming'],
    'Business': ['business', 'economy', 'market', 'stock', 'finance', 'company', 'ceo', 'investment', 'trade'],
    'Politics': ['politics', 'government', 'election', 'president', 'congress', 'senate', 'policy', 'law', 'vote'],
    'Science': ['science', 'research', 'study', 'discovery', 'experiment', 'scientist', 'laboratory', 'physics', 'chemistry'],
    'Health': ['health', 'medical', 'doctor', 'hospital', 'disease', 'treatment', 'medicine', 'wellness', 'fitness'],
    'Entertainment': ['entertainment', 'movie', 'music', 'celebrity', 'film', 'actor', 'show', 'concert', 'album'],
    'Sports': ['sports', 'game', 'team', 'player', 'championship', 'league', 'football', 'basketball', 'soccer'],
    'World News': ['world', 'international', 'global', 'country', 'nation', 'foreign', 'diplomatic']
  };
  
  let maxScore = 0;
  let bestCategory = 'World News';
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }
  
  return bestCategory;
};

const fetchArticle = async (url) => {
  await initDatabase();
  
  const existing = await db.getFirstAsync(
    'SELECT * FROM articles WHERE url = ?',
    [url]
  );
  
  if (existing) {
    return existing;
  }
  
  const bypassServices = [
    `https://12ft.io/${url}`,
    `https://archive.is/newest/${url}`,
    url
  ];
  
  let articleData = null;
  let lastError = null;
  
  for (const serviceUrl of bypassServices) {
    try {
      const response = await axios.get(serviceUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const html = response.data;
      
      let title = '';
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        title = titleMatch[1].replace(/\s+/g, ' ').trim();
      }
      
      let content = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
      
      if (content.length < 200) {
        continue;
      }
      
      content = content.substring(0, 5000);
      
      let imageUrl = null;
      const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
      if (ogImageMatch) {
        imageUrl = ogImageMatch[1];
      }
      
      let author = 'Unknown';
      const authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i);
      if (authorMatch) {
        author = authorMatch[1];
      }
      
      const source = extractDomain(url);
      const category = categorizeArticle(title, content, url);
      const now = new Date().toISOString();
      
      articleData = {
        url,
        title: title || 'Untitled Article',
        content,
        author,
        source,
        publishedDate: now,
        fetchedAt: now,
        imageUrl,
        category
      };
      
      break;
    } catch (error) {
      lastError = error;
      continue;
    }
  }
  
  if (!articleData) {
    throw new Error(lastError?.message || 'Failed to fetch article from all services');
  }
  
  await db.runAsync(
    `INSERT INTO articles (url, title, content, author, source, publishedDate, fetchedAt, imageUrl, category)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      articleData.url,
      articleData.title,
      articleData.content,
      articleData.author,
      articleData.source,
      articleData.publishedDate,
      articleData.fetchedAt,
      articleData.imageUrl,
      articleData.category
    ]
  );
  
  return articleData;
};

const getSavedArticles = async () => {
  await initDatabase();
  
  const articles = await db.getAllAsync(
    'SELECT * FROM articles ORDER BY fetchedAt DESC'
  );
  
  return articles;
};

const deleteArticle = async (url) => {
  await initDatabase();
  
  await db.runAsync('DELETE FROM articles WHERE url = ?', [url]);
};

const getCategories = async () => {
  await initDatabase();
  
  const categories = [
    'Technology', 'Business', 'Politics', 'Science', 
    'Health', 'Entertainment', 'Sports', 'World News'
  ];
  
  const result = [];
  
  for (const category of categories) {
    const pref = await db.getFirstAsync(
      'SELECT value FROM user_preferences WHERE key = ?',
      [`category_${category}`]
    );
    
    result.push({
      id: category,
      name: category,
      selected: pref?.value === 'true'
    });
  }
  
  return result;
};

const toggleCategory = async (categoryName, selected) => {
  await initDatabase();
  
  await db.runAsync(
    'INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)',
    [`category_${categoryName}`, selected ? 'true' : 'false']
  );
};

const getSelectedCategories = async () => {
  await initDatabase();
  
  const categories = await getCategories();
  return categories.filter(c => c.selected).map(c => c.name);
};

const getArticlesByCategory = async (category) => {
  await initDatabase();
  
  const articles = await db.getAllAsync(
    'SELECT * FROM articles WHERE category = ? ORDER BY fetchedAt DESC LIMIT 10',
    [category]
  );
  
  return articles;
};

const getRecommendedArticles = async () => {
  await initDatabase();
  
  const selectedCategories = await getSelectedCategories();
  
  if (selectedCategories.length === 0) {
    return [];
  }
  
  const placeholders = selectedCategories.map(() => '?').join(',');
  const articles = await db.getAllAsync(
    `SELECT * FROM articles WHERE category IN (${placeholders}) ORDER BY fetchedAt DESC LIMIT 10`,
    selectedCategories
  );
  
  return articles;
};

const searchArticles = async (query) => {
  await initDatabase();
  
  const searchTerm = `%${query}%`;
  const articles = await db.getAllAsync(
    `SELECT * FROM articles 
     WHERE title LIKE ? OR content LIKE ? OR source LIKE ?
     ORDER BY fetchedAt DESC LIMIT 20`,
    [searchTerm, searchTerm, searchTerm]
  );
  
  return articles;
};

initDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
});

export {
  fetchArticle,
  getSavedArticles,
  deleteArticle,
  getCategories,
  toggleCategory,
  getSelectedCategories,
  getArticlesByCategory,
  getRecommendedArticles,
  searchArticles
};
