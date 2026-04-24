import { GitProvider } from '../services/git/GitProviderService';

export interface GitCredentials {
  provider: GitProvider;
  token: string;
  username?: string;
}

export interface GitRepository {
  id: string;
  name: string;
  fullName: string;
  cloneUrl: string;
  defaultBranch: string;
  private: boolean;
  localPath?: string;
  lastUpdated?: Date;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: Date;
  parentHashes: string[];
}

export interface GitBranch {
  name: string;
  commitHash: string;
  isCurrent: boolean;
  isRemote: boolean;
}

export interface GitDiff {
  filePath: string;
  additions: number;
  deletions: number;
  changes: number;
  lines: GitDiffLine[];
}

export interface GitDiffLine {
  type: 'add' | 'remove' | 'normal';
  content: string;
  lineNumber?: number;
}

export interface GitStatus {
  staged: string[];
  unstaged: string[];
  conflicts: string[];
}

export interface GitPullRequest {
  id: string;
  title: string;
  description: string;
  state: 'open' | 'closed' | 'merged';
  createdAt: Date;
  updatedAt: Date;
  author: string;
  sourceBranch: string;
  targetBranch: string;
  reviewStatus: 'approved' | 'changes_requested' | 'pending';
  commentsCount: number;
}
