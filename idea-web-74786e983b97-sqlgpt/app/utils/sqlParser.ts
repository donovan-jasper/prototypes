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
    const today = new Date();
    let dateCondition = '';

    if (lowerCaseQuery.includes('last quarter')) {
      const currentQuarter = Math.floor((today.getMonth() + 3) / 3);
      const lastQuarter = currentQuarter === 1 ? 4 : currentQuarter - 1;
      const lastQuarterYear = lastQuarter === 4 ? today.getFullYear() - 1 : today.getFullYear();

      const quarterStartMonth = (lastQuarter - 1) * 3;
      const quarterStart = new Date(lastQuarterYear, quarterStartMonth, 1);
      const quarterEnd = new Date(lastQuarterYear, quarterStartMonth + 3, 0);

      dateCondition = ` WHERE date BETWEEN '${formatDate(quarterStart)}' AND '${formatDate(quarterEnd)}'`;
    } else if (lowerCaseQuery.includes('last month')) {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      dateCondition = ` WHERE date BETWEEN '${formatDate(lastMonth)}' AND '${formatDate(lastMonthEnd)}'`;
    } else if (lowerCaseQuery.includes('this year')) {
      const yearStart = new Date(today.getFullYear(), 0, 1);
      const yearEnd = new Date(today.getFullYear(), 11, 31);
      dateCondition = ` WHERE date BETWEEN '${formatDate(yearStart)}' AND '${formatDate(yearEnd)}'`;
    } else if (lowerCaseQuery.includes('yesterday')) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      dateCondition = ` WHERE date = '${formatDate(yesterday)}'`;
    } else if (lowerCaseQuery.includes('today')) {
      dateCondition = ` WHERE date = '${formatDate(today)}'`;
    } else if (lowerCaseQuery.includes('last week')) {
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      dateCondition = ` WHERE date BETWEEN '${formatDate(lastWeekStart)}' AND '${formatDate(lastWeekEnd)}'`;
    } else if (lowerCaseQuery.includes('this week')) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      dateCondition = ` WHERE date BETWEEN '${formatDate(weekStart)}' AND '${formatDate(weekEnd)}'`;
    }

    sqlQuery += dateCondition;

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

    // Add LIMIT clause if requested
    if (lowerCaseQuery.includes('top ') || lowerCaseQuery.includes('limit ')) {
      const limitMatch = lowerCaseQuery.match(/(top|limit)\s+(\d+)/);
      if (limitMatch && limitMatch[2]) {
        sqlQuery += ` LIMIT ${limitMatch[2]}`;
      }
    }

    sqlQuery += ';';
    setQuery(sqlQuery);
    return sqlQuery;
  };

  // Helper function to format dates as YYYY-MM-DD
  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return { query, parseNaturalQuery };
};

export default useSQLParser;
