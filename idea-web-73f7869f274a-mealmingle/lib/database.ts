import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('feastflow.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        restaurant TEXT,
        menuLink TEXT,
        deadline TEXT,
        status TEXT,
        paymentStatus TEXT,
        driverLocation TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS groups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS group_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        groupId INTEGER,
        name TEXT,
        FOREIGN KEY (groupId) REFERENCES groups (id)
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER,
        participantId INTEGER,
        amount REAL,
        status TEXT,
        FOREIGN KEY (orderId) REFERENCES orders (id),
        FOREIGN KEY (participantId) REFERENCES group_members (id)
      );`
    );
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER,
        participantId INTEGER,
        name TEXT,
        price REAL,
        quantity INTEGER,
        FOREIGN KEY (orderId) REFERENCES orders (id),
        FOREIGN KEY (participantId) REFERENCES group_members (id)
      );`
    );
  });
};

export const createOrder = (order, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO orders (restaurant, menuLink, deadline, status, paymentStatus) VALUES (?, ?, ?, ?, ?);',
      [order.restaurant, order.menuLink, order.deadline, order.status, 'pending'],
      (_, { insertId }) => {
        callback({ ...order, id: insertId, paymentStatus: 'pending' });
      }
    );
  });
};

export const fetchOrders = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM orders;',
      [],
      (_, { rows: { _array } }) => {
        callback(_array);
      }
    );
  });
};

export const updateOrderPaymentStatus = (orderId, paymentStatus, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE orders SET paymentStatus = ? WHERE id = ?;',
      [paymentStatus, orderId],
      () => {
        callback({ success: true });
      },
      (_, error) => {
        console.error('Error updating payment status:', error);
        callback({ success: false, error });
      }
    );
  });
};

export const createGroup = (group, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO groups (name) VALUES (?);',
      [group.name],
      (_, { insertId }) => {
        callback({ ...group, id: insertId });
      }
    );
  });
};

export const fetchGroups = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM groups;',
      [],
      (_, { rows: { _array } }) => {
        callback(_array);
      }
    );
  });
};

export const addGroupMember = (member, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO group_members (groupId, name) VALUES (?, ?);',
      [member.groupId, member.name],
      (_, { insertId }) => {
        callback({ ...member, id: insertId });
      }
    );
  });
};

export const fetchGroupMembers = (groupId, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM group_members WHERE groupId = ?;',
      [groupId],
      (_, { rows: { _array } }) => {
        callback(_array);
      }
    );
  });
};

export const addCartItem = (item, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO cart_items (orderId, participantId, name, price, quantity) VALUES (?, ?, ?, ?, ?);',
      [item.orderId, item.participantId, item.name, item.price, item.quantity],
      (_, { insertId }) => {
        callback({ ...item, id: insertId });
      }
    );
  });
};

export const fetchCartItems = (orderId, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM cart_items WHERE orderId = ?;',
      [orderId],
      (_, { rows: { _array } }) => {
        callback(_array);
      }
    );
  });
};

export const createPayment = (payment, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO payments (orderId, participantId, amount, status) VALUES (?, ?, ?, ?);',
      [payment.orderId, payment.participantId, payment.amount, payment.status],
      (_, { insertId }) => {
        callback({ ...payment, id: insertId });
      }
    );
  });
};

export const fetchPayments = (orderId, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM payments WHERE orderId = ?;',
      [orderId],
      (_, { rows: { _array } }) => {
        callback(_array);
      }
    );
  });
};
