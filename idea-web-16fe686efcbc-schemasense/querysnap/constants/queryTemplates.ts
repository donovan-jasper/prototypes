export const queryTemplates = [
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
  // Add more templates
];
