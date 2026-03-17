import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('safecircle.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Create resources table if it doesn't exist
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS resources (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          address TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          phone TEXT,
          hours TEXT,
          wheelchair_accessible BOOLEAN,
          pet_friendly BOOLEAN,
          open_now BOOLEAN
        );`,
        [],
        () => {
          // Check if table is empty, if so, seed with initial data
          tx.executeSql(
            'SELECT COUNT(*) as count FROM resources',
            [],
            (_, result) => {
              if (result.rows.item(0).count === 0) {
                seedDatabase(tx);
              }
              resolve(db);
            },
            (_, error) => reject(error)
          );
        },
        (_, error) => reject(error)
      );
    });
  });
};

const seedDatabase = (tx: SQLite.SQLTransaction) => {
  // Sample data - in a real app, this would come from an API or larger dataset
  const sampleResources = [
    {
      name: 'San Francisco Homeless Services',
      type: 'shelter',
      address: '123 Market St, San Francisco, CA 94103',
      latitude: 37.7849,
      longitude: -122.4094,
      phone: '(415) 555-1234',
      hours: '24/7',
      wheelchair_accessible: true,
      pet_friendly: false,
      open_now: true
    },
    {
      name: 'Food Bank of San Francisco',
      type: 'food',
      address: '456 Powell St, San Francisco, CA 94102',
      latitude: 37.7859,
      longitude: -122.4064,
      phone: '(415) 555-5678',
      hours: 'Mon-Fri 9am-5pm',
      wheelchair_accessible: true,
      pet_friendly: false,
      open_now: true
    },
    {
      name: 'Legal Aid Society',
      type: 'legal',
      address: '789 Van Ness Ave, San Francisco, CA 94102',
      latitude: 37.7869,
      longitude: -122.4209,
      phone: '(415) 555-9012',
      hours: 'Mon-Fri 10am-4pm',
      wheelchair_accessible: true,
      pet_friendly: false,
      open_now: true
    },
    {
      name: 'Animal Shelter',
      type: 'shelter',
      address: '321 Geary Blvd, San Francisco, CA 94109',
      latitude: 37.7879,
      longitude: -122.4204,
      phone: '(415) 555-3456',
      hours: 'Mon-Sat 10am-6pm',
      wheelchair_accessible: false,
      pet_friendly: true,
      open_now: true
    },
    {
      name: 'Community Health Center',
      type: 'health',
      address: '654 Divisadero St, San Francisco, CA 94117',
      latitude: 37.7799,
      longitude: -122.4394,
      phone: '(415) 555-7890',
      hours: 'Mon-Fri 8am-6pm',
      wheelchair_accessible: true,
      pet_friendly: false,
      open_now: true
    }
  ];

  // Insert sample data
  sampleResources.forEach(resource => {
    tx.executeSql(
      `INSERT INTO resources (
        name, type, address, latitude, longitude, phone, hours,
        wheelchair_accessible, pet_friendly, open_now
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resource.name,
        resource.type,
        resource.address,
        resource.latitude,
        resource.longitude,
        resource.phone,
        resource.hours,
        resource.wheelchair_accessible ? 1 : 0,
        resource.pet_friendly ? 1 : 0,
        resource.open_now ? 1 : 0
      ]
    );
  });
};

export const getResourcesByLocation = async (
  latitude: number,
  longitude: number,
  maxDistance: number
) => {
  return new Promise<any[]>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM resources`,
        [],
        (_, result) => {
          const resources = [];
          for (let i = 0; i < result.rows.length; i++) {
            resources.push(result.rows.item(i));
          }
          resolve(resources);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getResourceById = async (id: number) => {
  return new Promise<any>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM resources WHERE id = ?`,
        [id],
        (_, result) => {
          if (result.rows.length > 0) {
            resolve(result.rows.item(0));
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};
