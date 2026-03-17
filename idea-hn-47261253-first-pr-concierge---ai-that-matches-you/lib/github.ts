import { Octokit } from '@octokit/rest';
import { Issue } from '../types';

let octokit: Octokit | null = null;

export const initializeGitHubClient = (token: string) => {
  octokit = new Octokit({ auth: token });
};

export const fetchUserRepos = async (): Promise<any[]> => {
  if (!octokit) throw new Error('GitHub client not initialized');

  try {
    const response = await octokit.rest.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: 'updated',
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user repos:', error);
    throw error;
  }
};

export const fetchGoodFirstIssues = async (repos: any[]): Promise<Issue[]> => {
  if (!octokit) throw new Error('GitHub client not initialized');

  const languages = repos.reduce((acc, repo) => {
    if (repo.language) {
      acc[repo.language] = (acc[repo.language] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topLanguages = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang.toLowerCase());

  const issues: Issue[] = [];

  for (const repo of repos) {
    try {
      const response = await octokit.rest.issues.listForRepo({
        owner: repo.owner.login,
        repo: repo.name,
        labels: 'good-first-issue',
        state: 'open',
        per_page: 5,
      });

      issues.push(...response.data.map(issue => ({
        id: issue.id,
        title: issue.title,
        url: issue.html_url,
        labels: issue.labels.map((label: any) => typeof label === 'string' ? label : label.name),
        repository: {
          name: repo.name,
          owner: repo.owner.login,
          url: repo.html_url,
        },
        difficulty: Math.min(5, Math.max(1, Math.floor(Math.random() * 5) + 1)), // Simplified difficulty calculation
        created_at: issue.created_at,
      })));
    } catch (error) {
      console.error(`Error fetching issues for ${repo.name}:`, error);
    }
  }

  return issues.filter(issue =>
    issue.labels.some(label =>
      topLanguages.includes(label.toLowerCase()) ||
      label.toLowerCase().includes('good-first-issue')
    )
  );
};

export const commentOnIssue = async (issueId: number, comment: string, repoOwner: string, repoName: string): Promise<void> => {
  if (!octokit) throw new Error('GitHub client not initialized');

  try {
    await octokit.rest.issues.createComment({
      issue_number: issueId,
      owner: repoOwner,
      repo: repoName,
      body: comment,
    });
  } catch (error) {
    console.error('Error commenting on issue:', error);
    throw error;
  }
};
