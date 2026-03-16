import { useState } from 'react';

const useSQLParser = () => {
  const [query, setQuery] = useState('');

  const parseNaturalQuery = (naturalQuery: string): string => {
    const lowerCaseQuery = naturalQuery.toLowerCase();
    let sqlQuery = '';

    if (lowerCaseQuery.includes('show me sales')) {
      sqlQuery = 'SELECT * FROM sales';
    } else if (lowerCaseQuery.includes('show me customers')) {
      sqlQuery = 'SELECT * FROM customers';
    } else if (lowerCaseQuery.includes('show me orders')) {
      sqlQuery = 'SELECT * FROM orders';
    } else {
      sqlQuery = 'SELECT * FROM table';
    }

    if (lowerCaseQuery.includes('last quarter')) {
      sqlQuery += " WHERE date BETWEEN '2023-10-01' AND '2023-12-31'";
    } else if (lowerCaseQuery.includes('last month')) {
      sqlQuery += " WHERE date >= date('now', '-1 month')";
    } else if (lowerCaseQuery.includes('this year')) {
      sqlQuery += " WHERE strftime('%Y', date) = strftime('%Y', 'now')";
    }

    sqlQuery += ';';
    setQuery(sqlQuery);
    return sqlQuery;
  };

  return { query, parseNaturalQuery };
};

export default useSQLParser;
