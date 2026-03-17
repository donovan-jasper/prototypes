export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockCriteria: {
    type: 'events_joined' | 'events_created' | 'consecutive_weekends';
    threshold: number;
  };
}

export interface UserBadge {
  badgeId: string;
  earnedAt: string;
  progress?: number;
}

export interface BadgeProgress {
  badge: Badge;
  earned: boolean;
  progress: number;
  earnedAt?: string;
}
