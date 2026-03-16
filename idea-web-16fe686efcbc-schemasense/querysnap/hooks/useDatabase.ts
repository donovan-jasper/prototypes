import { useState, useEffect } from 'react';
import useStore from '../lib/store';
import { createDatabase, getSchema, importDatabase } from '../lib/database';

export const useDatabase = () => {
  const { databases, addDatabase } = useStore();
  const [loading, setLoading] = useState(false);

  const handleAddDatabase = async (file) => {
    setLoading(true);
    const db = await createDatabase(file.name);
    await importDatabase(db, file.data);
    const schema = await getSchema(db);
    addDatabase({ id: Date.now().toString(), name: file.name, schema });
    setLoading(false);
  };

  return { databases, loading, addDatabase: handleAddDatabase };
};
