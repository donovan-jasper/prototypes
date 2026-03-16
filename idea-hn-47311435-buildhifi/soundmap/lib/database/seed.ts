import { initDatabase } from './schema';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('soundmap.db');

export const seedDatabase = () => {
  initDatabase();

  db.transaction(tx => {
    tx.executeSql(
      `INSERT INTO products (id, name, category, brand, impedance, power, connections, price, imageUrl) VALUES
      ('1', 'RX-V4A', 'receiver', 'Yamaha', 8, 120, '["RCA", "HDMI"]', 1999.99, 'https://example.com/yamaha-rx-v4a.jpg'),
      ('2', 'RX-A1080', 'receiver', 'Yamaha', 8, 120, '["RCA", "HDMI"]', 1499.99, 'https://example.com/yamaha-rx-a1080.jpg'),
      ('3', 'Denon AVR-X2600W', 'receiver', 'Denon', 8, 120, '["RCA", "HDMI"]', 1999.99, 'https://example.com/denon-avr-x2600w.jpg'),
      ('4', 'Klipsch ProMedia PM-2.1', 'speaker', 'Klipsch', 8, 100, '["Binding Post"]', 199.99, 'https://example.com/klipsch-pm-2.1.jpg'),
      ('5', 'Klipsch ProMedia PM-4.1', 'speaker', 'Klipsch', 8, 100, '["Binding Post"]', 299.99, 'https://example.com/klipsch-pm-4.1.jpg'),
      ('6', 'SVS PB-1000', 'subwoofer', 'SVS', 4, 1000, '["Binding Post"]', 499.99, 'https://example.com/svs-pb-1000.jpg'),
      ('7', 'KEF LS50 Wireless II', 'speaker', 'KEF', 8, 100, '["RCA"]', 199.99, 'https://example.com/kef-ls50.jpg'),
      ('8', 'KEF Q150', 'speaker', 'KEF', 8, 100, '["RCA"]', 149.99, 'https://example.com/kef-q150.jpg');`
    );
    tx.executeSql(
      `INSERT INTO userSettings (isPremium, scanCount, systemCount) VALUES (0, 0, 0);`
    );
  });
};
