import { useState, useEffect } from 'react';
import useStore from '../lib/store';
import { getUserMatches, updateMatchStatus, createConversation } from '../lib/database/queries';
import { findMatches } from '../lib/ai/matchingEngine';
import { getPotentialMatches, createMatchRecord, subscribeToMatches } from '../lib/supabase';

export const useMatches = () => {
  const [matches, setMatches] = useStore((state) => [state.matches, state.setMatches]);
  const [loading, setLoading] = useState(true);
  const user = useStore((state) => state.user);

  useEffect(() => {
    if (user) {
      fetchMatches();
      setupMatchSubscription();
    }
  }, [user]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const localMatches = await getUserMatches(user.id);
      const potentialMatches = await getPotentialMatches(user.id);
      const calculatedMatches = await findMatches(user.id, potentialMatches);

      // Combine local matches with calculated matches
      const combinedMatches = [...localMatches, ...calculatedMatches];

      // Remove duplicates and sort by compatibility score
      const uniqueMatches = combinedMatches.reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);

      uniqueMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      setMatches(uniqueMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptMatch = async (matchId) => {
    try {
      await updateMatchStatus(matchId, 'accepted');
      await createConversation(matchId);
      await createMatchRecord(user.id, matchId, 100); // 100 is a placeholder score
      fetchMatches(); // Refresh matches after accepting
    } catch (error) {
      console.error('Error accepting match:', error);
    }
  };

  const passMatch = async (matchId) => {
    try {
      await updateMatchStatus(matchId, 'passed');
      fetchMatches(); // Refresh matches after passing
    } catch (error) {
      console.error('Error passing match:', error);
    }
  };

  const setupMatchSubscription = () => {
    const channel = subscribeToMatches(user.id, (payload) => {
      console.log('Match change received!', payload);
      fetchMatches(); // Refresh matches when a change is detected
    });

    return () => {
      channel.unsubscribe();
    };
  };

  return {
    matches,
    loading,
    fetchMatches,
    acceptMatch,
    passMatch,
  };
};
