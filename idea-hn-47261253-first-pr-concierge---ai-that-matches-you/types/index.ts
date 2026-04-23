export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
}

export interface Repository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  htmlUrl: string;
  stargazersCount: number;
  forksCount: number;
  openIssuesCount: number;
  language: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: number;
  title: string;
  body: string | null;
  htmlUrl: string;
  state: 'open' | 'closed';
  createdAt: string;
  updatedAt: string;
  labels: string[];
  repository: Repository;
  claimedAt?: string;
  completedAt?: string;
  prUrl?: string;
}

export interface Contribution {
  id: number;
  issueId: number;
  prUrl: string;
  mergedAt: string;
  streakDay: number;
}

export interface Achievement {
  id: number;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  shared: boolean;
}
