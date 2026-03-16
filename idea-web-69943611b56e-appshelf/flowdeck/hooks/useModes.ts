import { useState, useEffect } from 'react';
import { getModes, saveMode, deleteMode } from '../lib/database';

export const useModes = () => {
  const [modes, setModes] = useState([]);

  useEffect(() => {
    const fetchModes = async () => {
      const savedModes = await getModes();
      setModes(savedModes);
    };

    fetchModes();
  }, []);

  const addMode = async (mode) => {
    await saveMode(mode);
    setModes([...modes, mode]);
  };

  const removeMode = async (id) => {
    await deleteMode(id);
    setModes(modes.filter(mode => mode.id !== id));
  };

  return { modes, addMode, removeMode };
};
