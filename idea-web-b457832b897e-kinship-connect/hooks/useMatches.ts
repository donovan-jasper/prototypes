import { useState, useEffect, useContext } from 'react';
import { fetchMatches } from '../services/api';
import { getMatchSuggestions } from '../services/matching';
import { AuthContext } from '../contexts/AuthContext';

export const useMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const allUsers = await fetchMatches(user.id);
      const suggestedMatches = getMatchSuggestions(user, allUsers, 20);
      setMatches(suggestedMatches);
    } catch (err) {
      setError(err.message);
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  const refreshMatches = () => {
    loadMatches();
  };

  return { matches, loading, error, refreshMatches };
};
