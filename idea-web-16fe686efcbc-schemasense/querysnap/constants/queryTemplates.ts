export const queryTemplates = [
  {
    name: 'Show All Records',
    description: 'Show all records from table',
    sql: 'SELECT * FROM table_name LIMIT 100',
  },
  {
    name: 'Count Records',
    description: 'Count total number of records',
    sql: 'SELECT COUNT(*) as total FROM table_name',
  },
  {
    name: 'Top Customers',
    description: 'Show customers with highest total purchases',
    sql: 'SELECT customer_id, SUM(amount) as total FROM orders GROUP BY customer_id ORDER BY total DESC LIMIT 5',
  },
  {
    name: 'Low Stock Items',
    description: 'Show products with quantity below threshold',
    sql: 'SELECT product_id, name, quantity FROM products WHERE quantity < 10',
  },
  {
    name: 'Recent Orders',
    description: 'Show most recent orders',
    sql: 'SELECT * FROM orders ORDER BY date DESC LIMIT 10',
  },
  {
    name: 'High Value Orders',
    description: 'Show orders above certain amount',
    sql: 'SELECT * FROM orders WHERE total > 100 ORDER BY total DESC',
  },
  {
    name: 'Group by Category',
    description: 'Group items by category with counts',
    sql: 'SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC',
  },
  {
    name: 'Average Price',
    description: 'Calculate average price of products',
    sql: 'SELECT AVG(price) as average_price FROM products',
  },
  {
    name: 'Total Sales',
    description: 'Calculate total sales amount',
    sql: 'SELECT SUM(total) as total_sales FROM orders',
  },
  {
    name: 'Search by Name',
    description: 'Find records matching name',
    sql: 'SELECT * FROM table_name WHERE name LIKE "%search%" LIMIT 50',
  },
];
