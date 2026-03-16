export const parseNaturalQuery = (naturalQuery: string): string => {
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
    sqlQuery += " WHERE date BETWEEN '2023-10-01' AND '2023-12-31'";
  } else if (lowerCaseQuery.includes('last month')) {
    sqlQuery += " WHERE date >= date('now', '-1 month')";
  } else if (lowerCaseQuery.includes('this year')) {
    sqlQuery += " WHERE strftime('%Y', date) = strftime('%Y', 'now')";
  } else if (lowerCaseQuery.includes('yesterday')) {
    sqlQuery += " WHERE date = date('now', '-1 day')";
  } else if (lowerCaseQuery.includes('today')) {
    sqlQuery += " WHERE date = date('now')";
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
  return sqlQuery;
};
