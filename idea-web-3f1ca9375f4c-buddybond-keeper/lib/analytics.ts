import { Friend } from './types';
import { getAllFriends, getInteractionsByFriend, calculateHealthScore } from './database';

export interface DashboardStats {
  totalFriends: number;
  friendsNeedingAttention: number;
  interactionsThisMonth: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const friends = await getAllFriends();

  let friendsNeedingAttention = 0;
  let interactionsThisMonth = 0;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  for (const friend of friends) {
    const healthStatus = calculateHealthScore(friend);
    if (healthStatus === 'warning' || healthStatus === 'neglected') {
      friendsNeedingAttention++;
    }

    const interactions = await getInteractionsByFriend(friend.id);
    const monthlyInteractions = interactions.filter(interaction => {
      const interactionDate = new Date(interaction.date);
      return interactionDate >= monthStart;
    });
    interactionsThisMonth += monthlyInteractions.length;
  }

  return {
    totalFriends: friends.length,
    friendsNeedingAttention,
    interactionsThisMonth,
  };
}

export interface FriendWithDaysSinceContact extends Friend {
  daysSinceContact: number;
}

export async function getFriendsNeedingAttention(limit: number = 3): Promise<FriendWithDaysSinceContact[]> {
  const friends = await getAllFriends();

  const friendsWithDays: FriendWithDaysSinceContact[] = friends
    .map(friend => {
      const healthStatus = calculateHealthScore(friend);
      if (healthStatus === 'healthy') {
        return null;
      }

      let daysSinceContact = Infinity;
      if (friend.lastContacted) {
        const lastContactDate = new Date(friend.lastContacted);
        const now = new Date();
        daysSinceContact = Math.floor((now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        ...friend,
        daysSinceContact,
      };
    })
    .filter((f): f is FriendWithDaysSinceContact => f !== null)
    .sort((a, b) => b.daysSinceContact - a.daysSinceContact);

  return friendsWithDays.slice(0, limit);
}

export async function getFriendshipHealthSummary(): Promise<{
  healthy: number;
  warning: number;
  neglected: number;
}> {
  const friends = await getAllFriends();
  const summary = {
    healthy: 0,
    warning: 0,
    neglected: 0,
  };

  for (const friend of friends) {
    const healthStatus = calculateHealthScore(friend);
    summary[healthStatus]++;
  }

  return summary;
}
