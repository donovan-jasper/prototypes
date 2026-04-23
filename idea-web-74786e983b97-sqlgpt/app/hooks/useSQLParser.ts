import { useState } from 'react';

const useSQLParser = () => {
  const [query, setQuery] = useState('');

  const parseNaturalQuery = (naturalQuery: string): string => {
    if (!naturalQuery) return '';

    const lowerCaseQuery = naturalQuery.toLowerCase();
    let sqlQuery = '';

    // Basic table detection
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

    // Date filtering
    if (lowerCaseQuery.includes('last quarter')) {
      const currentDate = new Date();
      const quarterStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
      const quarterEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      sqlQuery += ` WHERE date BETWEEN '${quarterStart.toISOString().split('T')[0]}' AND '${quarterEnd.toISOString().split('T')[0]}'`;
    } else if (lowerCaseQuery.includes('last month')) {
      const currentDate = new Date();
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      sqlQuery += ` WHERE date BETWEEN '${monthStart.toISOString().split('T')[0]}' AND '${monthEnd.toISOString().split('T')[0]}'`;
    } else if (lowerCaseQuery.includes('this year')) {
      const currentYear = new Date().getFullYear();
      sqlQuery += ` WHERE strftime('%Y', date) = '${currentYear}'`;
    }

    // Aggregation
    if (lowerCaseQuery.includes('total') || lowerCaseQuery.includes('sum')) {
      if (lowerCaseQuery.includes('sales')) {
        sqlQuery = 'SELECT SUM(amount) as total_sales FROM sales';
      } else if (lowerCaseQuery.includes('orders')) {
        sqlQuery = 'SELECT COUNT(*) as total_orders FROM orders';
      }
    }

    // Sorting
    if (lowerCaseQuery.includes('sorted by') || lowerCaseQuery.includes('ordered by')) {
      const sortField = lowerCaseQuery.match(/(?:sorted by|ordered by)\s+(\w+)/)?.[1];
      if (sortField) {
        sqlQuery += ` ORDER BY ${sortField}`;
      }
    }

    sqlQuery += ';';
    setQuery(sqlQuery);
    return sqlQuery;
  };

  return { query, parseNaturalQuery };
};

export default useSQLParser;
