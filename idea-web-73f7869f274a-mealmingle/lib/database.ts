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
        stripeCustomerId TEXT,
        isOrganizer INTEGER DEFAULT 0,
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
      `SELECT
        orders.*,
        json_group_array(DISTINCT json_object(
          'id', cart_items.id,
          'name', cart_items.name,
          'price', cart_items.price,
          'quantity', cart_items.quantity,
          'participantId', cart_items.participantId
        )) as items,
        json_group_array(DISTINCT json_object(
          'id', group_members.id,
          'name', group_members.name,
          'stripeCustomerId', group_members.stripeCustomerId,
          'isOrganizer', group_members.isOrganizer
        )) as participants
      FROM orders
      LEFT JOIN cart_items ON orders.id = cart_items.orderId
      LEFT JOIN group_members ON orders.id = group_members.groupId
      GROUP BY orders.id;`,
      [],
      (_, { rows: { _array } }) => {
        const parsedOrders = _array.map(order => ({
          ...order,
          items: JSON.parse(order.items).filter(item => item.id !== null),
          participants: JSON.parse(order.participants).filter(participant => participant.id !== null)
        }));
        callback(parsedOrders);
      }
    );
  });
};

export const updateOrderStatus = (orderId, status, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE orders SET status = ? WHERE id = ?;',
      [status, orderId],
      () => {
        callback({ success: true });
      },
      (_, error) => {
        console.error('Error updating order status:', error);
        callback({ success: false, error });
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

export const updatePaymentStatus = (participantId, orderId, status, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE payments SET status = ? WHERE participantId = ? AND orderId = ?;',
      [status, participantId, orderId],
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
      'INSERT INTO group_members (groupId, name, stripeCustomerId, isOrganizer) VALUES (?, ?, ?, ?);',
      [member.groupId, member.name, member.stripeCustomerId || null, member.isOrganizer ? 1 : 0],
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
