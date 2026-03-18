import axios from 'axios';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('librio.db');

// Initialize database
const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT UNIQUE,
        title TEXT,
        content TEXT,
        author TEXT,
        publishedDate TEXT,
        imageUrl TEXT,
        source TEXT,
        fetchedAt TEXT
      )`,
      [],
      () => console.log('Articles table created'),
      (_, error) => console.log('Error creating table:', error)
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        selected INTEGER DEFAULT 0
      )`,
      [],
      () => console.log('Categories table created'),
      (_, error) => console.log('Error creating categories table:', error)
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS article_categories (
        article_url TEXT,
        category_name TEXT,
        PRIMARY KEY (article_url, category_name)
      )`,
      [],
      () => console.log('Article categories table created'),
      (_, error) => console.log('Error creating article_categories table:', error)
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS reading_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        article_url TEXT,
        read_at TEXT,
        duration INTEGER
      )`,
      [],
      () => console.log('Reading history table created'),
      (_, error) => console.log('Error creating reading_history table:', error)
    );

    // Insert default categories
    const defaultCategories = ['News', 'Tech', 'Business', 'Sports', 'Entertainment', 'Science', 'Health', 'Politics'];
    defaultCategories.forEach(category => {
      tx.executeSql(
        'INSERT OR IGNORE INTO categories (name, selected) VALUES (?, 0)',
        [category],
        null,
        (_, error) => console.log('Error inserting category:', error)
      );
    });
  });
};

initDatabase();

// Bypass services configuration
const BYPASS_SERVICES = {
  ARCHIVE_IS: 'https://archive.is/submit/',
  TWELVE_FT: 'https://12ft.io/',
  ARCHIVE_TODAY: 'https://archive.today/submit/',
};

// Extract domain from URL
const extractDomain = (url) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return '';
  }
};

// Categorize article based on content
const categorizeArticle = (title, content) => {
  const text = (title + ' ' + content).toLowerCase();
  const categories = [];

  const categoryKeywords = {
    'Tech': ['technology', 'software', 'app', 'digital', 'ai', 'computer', 'internet', 'startup', 'coding', 'developer'],
    'Business': ['business', 'economy', 'market', 'finance', 'stock', 'company', 'corporate', 'investment', 'trade'],
    'Sports': ['sports', 'game', 'team', 'player', 'championship', 'league', 'football', 'basketball', 'soccer'],
    'Entertainment': ['movie', 'music', 'celebrity', 'film', 'actor', 'entertainment', 'show', 'concert', 'album'],
    'Science': ['science', 'research', 'study', 'scientist', 'discovery', 'experiment', 'laboratory', 'physics'],
    'Health': ['health', 'medical', 'doctor', 'disease', 'treatment', 'hospital', 'patient', 'medicine', 'wellness'],
    'Politics': ['politics', 'government', 'election', 'president', 'congress', 'senate', 'policy', 'vote', 'law'],
    'News': ['news', 'breaking', 'report', 'update', 'latest', 'today', 'announced']
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const matches = keywords.filter(keyword => text.includes(keyword)).length;
    if (matches >= 2) {
      categories.push(category);
    }
  }

  return categories.length > 0 ? categories : ['News'];
};

// Fetch article using 12ft.io
const fetchWith12ft = async (url) => {
  try {
    const bypassUrl = `${BYPASS_SERVICES.TWELVE_FT}${encodeURIComponent(url)}`;
    const response = await axios.get(bypassUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    return parseArticleContent(response.data, url);
  } catch (error) {
    console.log('12ft.io failed:', error.message);
    return null;
  }
};

// Fetch article using archive.is
const fetchWithArchive = async (url) => {
  try {
    const submitResponse = await axios.post(
      BYPASS_SERVICES.ARCHIVE_IS,
      `url=${encodeURIComponent(url)}`,
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    const archivedUrl = submitResponse.headers.location || submitResponse.data.match(/https?:\/\/archive\.(is|today)\/[^\s"]+/)?.[0];
    
    if (archivedUrl) {
      const contentResponse = await axios.get(archivedUrl, { timeout: 30000 });
      return parseArticleContent(contentResponse.data, url);
    }
    
    return null;
  } catch (error) {
    console.log('Archive.is failed:', error.message);
    return null;
  }
};

// Direct fetch with basic parsing
const fetchDirect = async (url) => {
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    return parseArticleContent(response.data, url);
  } catch (error) {
    console.log('Direct fetch failed:', error.message);
    return null;
  }
};

// Parse HTML content to extract article data
const parseArticleContent = (html, url) => {
  try {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i) ||
                      html.match(/<h1[^>]*>([^<]+)<\/h1>/i) ||
                      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Article';

    const authorMatch = html.match(/<meta[^>]*name=["']author["'][^>]*content=["']([^"']+)["']/i) ||
                       html.match(/<span[^>]*class=["'][^"']*author[^"']*["'][^>]*>([^<]+)<\/span>/i);
    const author = authorMatch ? authorMatch[1].trim() : 'Unknown';

    const dateMatch = html.match(/<meta[^>]*property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i) ||
                     html.match(/<time[^>]*datetime=["']([^"']+)["']/i);
    const publishedDate = dateMatch ? dateMatch[1].trim() : new Date().toISOString();

    const imageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
    const imageUrl = imageMatch ? imageMatch[1].trim() : null;

    let content = '';
    
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                        html.match(/<div[^>]*class=["'][^"']*article-body[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
                        html.match(/<div[^>]*class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    
    if (articleMatch) {
      content = articleMatch[1];
    } else {
      const paragraphs = html.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
      content = paragraphs.join('\n\n');
    }

    content = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (content.length > 50000) {
      content = content.substring(0, 50000) + '...';
    }

    const source = extractDomain(url);

    return {
      url,
      title,
      content,
      author,
      publishedDate,
      imageUrl,
      source,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.log('Parse error:', error.message);
    return null;
  }
};

// Main fetch function with fallback strategy
export const fetchArticle = async (url) => {
  if (!url || !url.startsWith('http')) {
    throw new Error('Invalid URL');
  }

  let article = await fetchWith12ft(url);
  
  if (!article || !article.content || article.content.length < 100) {
    article = await fetchWithArchive(url);
  }
  
  if (!article || !article.content || article.content.length < 100) {
    article = await fetchDirect(url);
  }

  if (!article || !article.content) {
    throw new Error('Failed to fetch article content from all sources');
  }

  await saveArticle(article);

  return article;
};

// Save article to SQLite
const saveArticle = async (article) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT OR REPLACE INTO articles (url, title, content, author, publishedDate, imageUrl, source, fetchedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          article.url,
          article.title,
          article.content,
          article.author,
          article.publishedDate,
          article.imageUrl,
          article.source,
          article.fetchedAt,
        ],
        () => {
          const categories = categorizeArticle(article.title, article.content);
          categories.forEach(category => {
            tx.executeSql(
              'INSERT OR IGNORE INTO article_categories (article_url, category_name) VALUES (?, ?)',
              [article.url, category]
            );
          });
          resolve();
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Get saved articles
export const getSavedArticles = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM articles ORDER BY fetchedAt DESC',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

// Get article by URL
export const getArticleByUrl = async (url) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM articles WHERE url = ?',
        [url],
        (_, { rows }) => resolve(rows._array[0] || null),
        (_, error) => reject(error)
      );
    });
  });
};

// Delete article
export const deleteArticle = async (url) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM articles WHERE url = ?',
        [url],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

// Categories
export const getCategories = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM categories ORDER BY name',
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const toggleCategory = async (categoryName, selected) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE categories SET selected = ? WHERE name = ?',
        [selected ? 1 : 0, categoryName],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const getSelectedCategories = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT name FROM categories WHERE selected = 1',
        [],
        (_, { rows }) => resolve(rows._array.map(r => r.name)),
        (_, error) => reject(error)
      );
    });
  });
};

// Get articles by category
export const getArticlesByCategory = async (categoryName) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT a.* FROM articles a
         INNER JOIN article_categories ac ON a.url = ac.article_url
         WHERE ac.category_name = ?
         ORDER BY a.fetchedAt DESC`,
        [categoryName],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

// Reading history
export const trackReading = async (articleUrl, duration) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO reading_history (article_url, read_at, duration) VALUES (?, ?, ?)',
        [articleUrl, new Date().toISOString(), duration],
        () => resolve(),
        (_, error) => reject(error)
      );
    });
  });
};

export const getReadingHistory = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT a.*, rh.read_at, rh.duration
         FROM articles a
         INNER JOIN reading_history rh ON a.url = rh.article_url
         ORDER BY rh.read_at DESC
         LIMIT 50`,
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getRecommendedArticles = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT a.*, COUNT(rh.id) as read_count
         FROM articles a
         LEFT JOIN reading_history rh ON a.url = rh.article_url
         INNER JOIN article_categories ac ON a.url = ac.article_url
         INNER JOIN categories c ON ac.category_name = c.name
         WHERE c.selected = 1
         GROUP BY a.url
         ORDER BY read_count ASC, a.fetchedAt DESC
         LIMIT 20`,
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

// Search articles
export const searchArticles = async (query) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM articles
         WHERE title LIKE ? OR content LIKE ? OR source LIKE ?
         ORDER BY fetchedAt DESC`,
        [`%${query}%`, `%${query}%`, `%${query}%`],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};
