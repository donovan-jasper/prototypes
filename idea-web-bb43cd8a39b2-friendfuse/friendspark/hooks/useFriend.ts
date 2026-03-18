import { useState, useEffect } from 'react';
import { getFriends, getInteractions, addInteraction } from '../lib/database';
import { calculateStreaks } from '../lib/streaks';

export const useFriend = (friendId) => {
  const [friend, setFriend] = useState(null);
  const [streak, setStreak] = useState(null);
  const [interactions, setInteractions] = useState([]);

  const loadFriend = async () => {
    const friends = await getFriends();
    const foundFriend = friends.find(f => f.id === parseInt(friendId));
    setFriend(foundFriend);

    if (foundFriend) {
      const streaks = await calculateStreaks([foundFriend]);
      setStreak(streaks[foundFriend.id]);

      const friendInteractions = await getInteractions(foundFriend.id);
      setInteractions(friendInteractions);
    }
  };

  const logInteraction = async (type) => {
    await addInteraction({
      friend_id: parseInt(friendId),
      type,
      notes: '',
    });
    await loadFriend();
  };

  useEffect(() => {
    loadFriend();
  }, [friendId]);

  return { friend, streak, interactions, logInteraction };
};
