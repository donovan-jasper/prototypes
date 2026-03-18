import { useState, useEffect } from 'react';
import { getChallenges } from '../lib/database';

export const useChallenges = () => {
  const [challenges, setChallenges] = useState([]);

  const loadChallenges = async () => {
    const challengesData = await getChallenges();
    setChallenges(challengesData);
  };

  const refreshChallenges = async () => {
    await loadChallenges();
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  return { challenges, refreshChallenges };
};
