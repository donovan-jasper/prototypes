import { useState, useEffect } from 'react';
import { fetchConnections } from '../services/api';

export const useConnections = () => {
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

  return { connections, loading, error, fetchConnections: fetchConnectionsData };
};
