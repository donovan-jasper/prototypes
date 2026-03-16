import React, { createContext, useState, useEffect } from 'react';
import { fetchConnections } from '../services/api';

export const ConnectionContext = createContext();

export const ConnectionProvider = ({ children }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConnectionsData = async (userId) => {
    try {
      setLoading(true);
      const data = await fetchConnections(userId);
      setConnections(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConnectionContext.Provider value={{ connections, loading, error, fetchConnections: fetchConnectionsData }}>
      {children}
    </ConnectionContext.Provider>
  );
};
