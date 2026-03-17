import { create } from 'zustand';
import { fetchGoodFirstIssues, rankIssues, analyzeUserProfile } from '../lib/matching';
import { fetchUserRepos, commentOnIssue } from '../lib/github';
import { Issue } from '../types';

interface IssuesState {
  matchedIssues: Issue[];
  claimedIssues: Issue[];
  completedIssues: Issue[];
  loading: boolean;
  error: string | null;
  fetchMatches: () => Promise<void>;
  claimIssue: (issue: Issue) => Promise<void>;
  markCompleted: (issue: Issue, prUrl: string) => Promise<void>;
}

export const useIssuesStore = create<IssuesState>((set, get) => ({
  matchedIssues: [],
  claimedIssues: [],
  completedIssues: [],
  loading: false,
  error: null,

  fetchMatches: async () => {
    set({ loading: true, error: null });
    try {
      const userRepos = await fetchUserRepos();
      const profile = analyzeUserProfile(userRepos);
      const issues = await fetchGoodFirstIssues(userRepos);
      const rankedIssues = rankIssues(issues, profile);
      set({ matchedIssues: rankedIssues, loading: false });
    } catch (err) {
      set({ error: 'Failed to fetch issues', loading: false });
    }
  },

  claimIssue: async (issue: Issue) => {
    try {
      await commentOnIssue(
        issue.id,
        "I'd like to work on this issue!",
        issue.repository.owner,
        issue.repository.name
      );
      const { matchedIssues, claimedIssues } = get();
      const updatedMatches = matchedIssues.filter(i => i.id !== issue.id);
      set({
        matchedIssues: updatedMatches,
        claimedIssues: [...claimedIssues, { ...issue, claimedAt: new Date().toISOString() }]
      });
    } catch (err) {
      set({ error: 'Failed to claim issue' });
    }
  },

  markCompleted: async (issue: Issue, prUrl: string) => {
    const { claimedIssues, completedIssues } = get();
    const updatedClaims = claimedIssues.filter(i => i.id !== issue.id);
    set({
      claimedIssues: updatedClaims,
      completedIssues: [...completedIssues, { ...issue, prUrl, completedAt: new Date().toISOString() }]
    });
  },
}));
