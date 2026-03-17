import { useState } from 'react';

const useSQLParser = () => {
  const [query, setQuery] = useState('');

  const parseNaturalQuery = (naturalQuery: string): string => {
    if (!naturalQuery) return '';

    const lowerCaseQuery = naturalQuery.toLowerCase();
    let sqlQuery = '';

    // Determine the main table based on keywords
    if (lowerCaseQuery.includes('sales')) {
      sqlQuery = 'SELECT * FROM sales';
    } else if (lowerCaseQuery.includes('customers')) {
      sqlQuery = 'SELECT * FROM customers';
    } else if (lowerCaseQuery.includes('orders')) {
      sqlQuery = 'SELECT * FROM orders';
    } else if (lowerCaseQuery.includes('products')) {
      sqlQuery = 'SELECT * FROM products';
    } else {
      sqlQuery = 'SELECT * FROM table';
    }

    // Add conditions based on time-related keywords
    if (lowerCaseQuery.includes('last quarter')) {
      const today = new Date();
      const quarterStart = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      const quarterEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      sqlQuery += ` WHERE date BETWEEN '${quarterStart.toISOString().split('T')[0]}' AND '${quarterEnd.toISOString().split('T')[0]}'`;
    } else if (lowerCaseQuery.includes('last month')) {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      sqlQuery += ` WHERE date BETWEEN '${monthStart.toISOString().split('T')[0]}' AND '${monthEnd.toISOString().split('T')[0]}'`;
    } else if (lowerCaseQuery.includes('this year')) {
      const year = new Date().getFullYear();
      sqlQuery += ` WHERE strftime('%Y', date) = '${year}'`;
    } else if (lowerCaseQuery.includes('yesterday')) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      sqlQuery += ` WHERE date = '${yesterday.toISOString().split('T')[0]}'`;
    } else if (lowerCaseQuery.includes('today')) {
      const today = new Date();
      sqlQuery += ` WHERE date = '${today.toISOString().split('T')[0]}'`;
    }

    // Add ORDER BY clause if requested
    if (lowerCaseQuery.includes('order by') || lowerCaseQuery.includes('sorted by')) {
      if (lowerCaseQuery.includes('name')) {
        sqlQuery += ' ORDER BY name';
      } else if (lowerCaseQuery.includes('date')) {
        sqlQuery += ' ORDER BY date';
      } else if (lowerCaseQuery.includes('amount') || lowerCaseQuery.includes('price')) {
        sqlQuery += ' ORDER BY amount';
      }
    }

    sqlQuery += ';';
    setQuery(sqlQuery);
    return sqlQuery;
  };

  return { query, parseNaturalQuery };
};

export default useSQLParser;
