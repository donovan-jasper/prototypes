export interface Issue {
  id: number;
  title: string;
  url: string;
  labels: string[];
  repository: {
    name: string;
    owner: string;
    url: string;
  };
  difficulty: number;
  claimedAt?: string;
  completedAt?: string;
  prUrl?: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
  };
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
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
  unlockedAt: string;
  shared: boolean;
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}
