export interface DraftPost {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  platform: 'threads' | 'bluesky';
  username: string;
  accessToken: string;
}

export interface Post {
  id: string;
  content: string;
  platform: 'threads' | 'bluesky';
  publishedAt: Date;
  engagement: EngagementMetrics;
}

export interface ScheduledPost {
  id: string;
  content: string;
  platform: 'threads' | 'bluesky' | 'both';
  scheduledFor: Date;
  status: 'pending' | 'published' | 'failed';
}

export interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
}
