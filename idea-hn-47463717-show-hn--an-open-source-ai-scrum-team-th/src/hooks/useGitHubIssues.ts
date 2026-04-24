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
}

const useGitHubIssues = (repo: string, token: string) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

        setIssues(response.data);
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
