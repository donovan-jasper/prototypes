import { useState } from 'react';
import useStore from '../lib/store';
import { importDatabase } from '../lib/database';

export const useDatabase = () => {
  const { databases, addDatabase } = useStore();
  const [loading, setLoading] = useState(false);

  const handleAddDatabase = async (file: any) => {
    setLoading(true);
    try {
      const { db, schema, name } = await importDatabase(file);
      
      const rowCount = schema.tables.length > 0 
        ? (await db.executeSqlAsync(`SELECT COUNT(*) as count FROM ${schema.tables[0]}`, []))[0]?.count || 0
        : 0;
      
      addDatabase({
        id: Date.now().toString(),
        name,
        schema,
        connection: db,
        rowCount,
        lastAccessed: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error adding database:', error);
    } finally {
      setLoading(false);
    }
  };

  return { databases, loading, addDatabase: handleAddDatabase };
};
