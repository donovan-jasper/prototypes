import { useState, useEffect } from 'react';
import { Octokit } from '@octokit/rest';

interface Issue {
  id: number;
  title: string;
  state: string;
  number: number;
  user: {
    login: string;
  };
  created_at: string;
  updated_at: string;
  labels: any[];
  comments: number;
  aiTags?: string[];
  priorityScore?: number;
}

const useGitHubIssues = (repo: string, token: string) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Mock AI categorization function
  const categorizeIssue = (issue: Issue): string[] => {
    const tags: string[] = [];

    // Check for common patterns in titles
    if (issue.title.toLowerCase().includes('bug')) tags.push('bug');
    if (issue.title.toLowerCase().includes('feature')) tags.push('feature');
    if (issue.title.toLowerCase().includes('documentation')) tags.push('docs');

    // Check labels
    issue.labels.forEach(label => {
      if (label.name.toLowerCase().includes('priority')) {
        tags.push('priority');
      }
    });

    // Add based on comment count
    if (issue.comments > 5) tags.push('discussion');
    if (issue.comments === 0) tags.push('new');

    return [...new Set(tags)]; // Remove duplicates
  };

  // Mock AI prioritization function
  const calculatePriority = (issue: Issue): number => {
    let score = 0;

    // Higher score for older issues
    const createdDate = new Date(issue.created_at);
    const daysOld = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    score += Math.min(daysOld * 0.5, 30);

    // Higher score for more comments
    score += Math.min(issue.comments * 2, 20);

    // Higher score for priority labels
    const hasPriorityLabel = issue.labels.some(label =>
      label.name.toLowerCase().includes('priority')
    );
    if (hasPriorityLabel) score += 30;

    // Cap at 100
    return Math.min(score, 100);
  };

  useEffect(() => {
    const fetchIssues = async () => {
      if (!token || !repo) {
        setLoading(false);
        return;
      }

      try {
        const octokit = new Octokit({ auth: token });
        const [owner, repoName] = repo.split('/');

        const response = await octokit.request('GET /repos/{owner}/{repo}/issues', {
          owner,
          repo: repoName,
          state: 'open',
          sort: 'updated',
          per_page: 50,
        });

        // Process issues with AI categorization and prioritization
        const processedIssues = response.data.map(issue => ({
          ...issue,
          aiTags: categorizeIssue(issue),
          priorityScore: calculatePriority(issue),
          isPR: issue.pull_request !== undefined,
          prDetails: issue.pull_request ? issue : undefined,
        }));

        setIssues(processedIssues);
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [repo, token]);

  return { issues, loading };
};

export default useGitHubIssues;
