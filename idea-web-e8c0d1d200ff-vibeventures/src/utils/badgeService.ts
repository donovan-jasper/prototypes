import { collection, doc, setDoc, getDoc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Badge, UserBadge, BadgeProgress } from '../types/badge';

const BADGES: Badge[] = [
  {
    id: 'first_join',
    name: 'First Steps',
    description: 'Join your first event',
    icon: '🎉',
    unlockCriteria: { type: 'events_joined', threshold: 1 }
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Join 5 events',
    icon: '🦋',
    unlockCriteria: { type: 'events_joined', threshold: 5 }
  },
  {
    id: 'community_champion',
    name: 'Community Champion',
    description: 'Join 20 events',
    icon: '🏆',
    unlockCriteria: { type: 'events_joined', threshold: 20 }
  },
  {
    id: 'event_creator',
    name: 'Event Creator',
    description: 'Create your first event',
    icon: '✨',
    unlockCriteria: { type: 'events_created', threshold: 1 }
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Active for 3 consecutive weekends',
    icon: '⚡',
    unlockCriteria: { type: 'consecutive_weekends', threshold: 3 }
  }
];

export const getAllBadges = (): Badge[] => BADGES;

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  const badgesRef = collection(db, 'users', userId, 'badges');
  const snapshot = await getDocs(badgesRef);
  return snapshot.docs.map(doc => doc.data() as UserBadge);
};

export const checkAndAwardBadges = async (
  userId: string,
  activityType: 'events_joined' | 'events_created' | 'consecutive_weekends',
  currentCount: number
): Promise<Badge[]> => {
  const userBadges = await getUserBadges(userId);
  const earnedBadgeIds = new Set(userBadges.map(b => b.badgeId));
  const newBadges: Badge[] = [];

  for (const badge of BADGES) {
    if (
      badge.unlockCriteria.type === activityType &&
      currentCount >= badge.unlockCriteria.threshold &&
      !earnedBadgeIds.has(badge.id)
    ) {
      await awardBadge(userId, badge.id);
      newBadges.push(badge);
    }
  }

  return newBadges;
};

export const awardBadge = async (userId: string, badgeId: string): Promise<void> => {
  const badgeRef = doc(db, 'users', userId, 'badges', badgeId);
  await setDoc(badgeRef, {
    badgeId,
    earnedAt: new Date().toISOString(),
    progress: 100
  });
};

export const getBadgeProgress = async (userId: string): Promise<BadgeProgress[]> => {
  const userBadges = await getUserBadges(userId);
  const earnedMap = new Map(userBadges.map(b => [b.badgeId, b]));

  // Get user stats
  const eventsJoined = await getUserEventCount(userId, 'joined');
  const eventsCreated = await getUserEventCount(userId, 'created');
  const consecutiveWeekends = await getConsecutiveWeekends(userId);

  return BADGES.map(badge => {
    const userBadge = earnedMap.get(badge.id);
    let progress = 0;

    if (!userBadge) {
      switch (badge.unlockCriteria.type) {
        case 'events_joined':
          progress = Math.min(100, (eventsJoined / badge.unlockCriteria.threshold) * 100);
          break;
        case 'events_created':
          progress = Math.min(100, (eventsCreated / badge.unlockCriteria.threshold) * 100);
          break;
        case 'consecutive_weekends':
          progress = Math.min(100, (consecutiveWeekends / badge.unlockCriteria.threshold) * 100);
          break;
      }
    }

    return {
      badge,
      earned: !!userBadge,
      progress: userBadge ? 100 : progress,
      earnedAt: userBadge?.earnedAt
    };
  });
};

const getUserEventCount = async (userId: string, type: 'joined' | 'created'): Promise<number> => {
  const eventsRef = collection(db, 'events');
  const q = type === 'joined'
    ? query(eventsRef, where('participants', 'array-contains', userId))
    : query(eventsRef, where('creatorId', '==', userId));
  
  const snapshot = await getDocs(q);
  return snapshot.size;
};

const getConsecutiveWeekends = async (userId: string): Promise<number> => {
  // Simplified implementation - would need more complex logic to track actual consecutive weekends
  const eventsRef = collection(db, 'events');
  const q = query(eventsRef, where('participants', 'array-contains', userId));
  const snapshot = await getDocs(q);
  
  // This is a placeholder - real implementation would analyze event dates
  return Math.min(snapshot.size, 3);
};

export const getMostRecentBadge = async (userId: string): Promise<Badge | null> => {
  const userBadges = await getUserBadges(userId);
  if (userBadges.length === 0) return null;

  const sorted = userBadges.sort((a, b) => 
    new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
  );

  const mostRecent = sorted[0];
  return BADGES.find(b => b.id === mostRecent.badgeId) || null;
};
