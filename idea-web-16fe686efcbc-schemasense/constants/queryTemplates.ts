export const queryTemplates = [
  {
    natural: "show all customers",
    sql: "SELECT * FROM customers;"
  },
  {
    natural: "list all products",
    sql: "SELECT * FROM products;"
  },
  {
    natural: "how many orders",
    sql: "SELECT COUNT(*) FROM orders;"
  },
  {
    natural: "average order value",
    sql: "SELECT AVG(total) FROM orders;"
  },
  {
    natural: "total sales",
    sql: "SELECT SUM(total) FROM orders;"
  },
  {
    natural: "top customers",
    sql: "SELECT customer_id, SUM(total) as total_spent FROM orders GROUP BY customer_id ORDER BY total_spent DESC LIMIT 5;"
  },
  {
    natural: "recent orders",
    sql: "SELECT * FROM orders ORDER BY order_date DESC LIMIT 10;"
  },
  {
    natural: "products out of stock",
    sql: "SELECT * FROM products WHERE stock_quantity = 0;"
  },
  {
    natural: "high value customers",
    sql: "SELECT customer_id, SUM(total) as total_spent FROM orders GROUP BY customer_id HAVING total_spent > 1000;"
  },
  {
    natural: "monthly sales",
    sql: "SELECT strftime('%Y-%m', order_date) as month, SUM(total) as monthly_sales FROM orders GROUP BY month ORDER BY month;"
  }
];
