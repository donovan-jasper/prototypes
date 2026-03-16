import { useState, useEffect } from 'react';
import { getFriends, addFriend } from '../lib/database';

export const useFriends = () => {
  const [friends, setFriends] = useState([]);

  const refreshFriends = async () => {
    const friendsData = await getFriends();
    setFriends(friendsData);
  };

  const addNewFriend = async (friend) => {
    const friendId = await addFriend(friend);
    await refreshFriends();
    return friendId;
  };

  useEffect(() => {
    refreshFriends();
  }, []);

  return { friends, refreshFriends, addNewFriend };
};
