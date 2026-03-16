export const commonSchemas = {
  customers: {
    columns: ['id', 'name', 'email', 'phone', 'address'],
    types: {
      id: 'INTEGER PRIMARY KEY',
      name: 'TEXT',
      email: 'TEXT',
      phone: 'TEXT',
      address: 'TEXT',
    },
  },
  products: {
    columns: ['id', 'name', 'price', 'quantity', 'category'],
    types: {
      id: 'INTEGER PRIMARY KEY',
      name: 'TEXT',
      price: 'REAL',
      quantity: 'INTEGER',
      category: 'TEXT',
    },
  },
  orders: {
    columns: ['id', 'customer_id', 'date', 'total'],
    types: {
      id: 'INTEGER PRIMARY KEY',
      customer_id: 'INTEGER',
      date: 'TEXT',
      total: 'REAL',
    },
  },
};
