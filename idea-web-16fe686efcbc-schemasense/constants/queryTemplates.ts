export const queryTemplates = [
  {
    natural: "Show all customers",
    sql: "SELECT * FROM customers;"
  },
  {
    natural: "List all products",
    sql: "SELECT * FROM products;"
  },
  {
    natural: "Count orders",
    sql: "SELECT COUNT(*) FROM orders;"
  },
  {
    natural: "Average order value",
    sql: "SELECT AVG(total) FROM orders;"
  },
  {
    natural: "Top 5 customers",
    sql: "SELECT * FROM customers ORDER BY total_spent DESC LIMIT 5;"
  },
  {
    natural: "Recent orders",
    sql: "SELECT * FROM orders ORDER BY order_date DESC LIMIT 10;"
  },
  {
    natural: "Low stock items",
    sql: "SELECT * FROM products WHERE stock_quantity < 10;"
  },
  {
    natural: "Sales by month",
    sql: "SELECT strftime('%Y-%m', order_date) as month, SUM(total) as total_sales FROM orders GROUP BY month;"
  }
];
