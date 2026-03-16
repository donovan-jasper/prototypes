import { useState, useEffect } from 'react';
import { fetchMatches } from '../services/api';

export const useMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMatchesData = async (userId) => {
    try {
      setLoading(true);
      const data = await fetchMatches(userId);
      setMatches(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { matches, loading, error, fetchMatches: fetchMatchesData };
};
