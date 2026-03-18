import { useState, useEffect } from 'react';
import { getChallenges } from '../lib/database';

export const useChallenges = () => {
  const [challenges, setChallenges] = useState([]);

  const loadChallenges = async () => {
    const challengesData = await getChallenges();
    setChallenges(challengesData);
  };

  useEffect(() => {
    loadChallenges();
  }, []);

  return { challenges };
};
