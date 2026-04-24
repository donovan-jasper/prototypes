import { useState, useEffect } from 'react';
import { GitHub } from 'react-native-github-api';

interface Issue {
  id: string;
  title: string;
  state: string;
}

const useGitHubIssues = (repo: string) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const github = new GitHub();
        const issuesResponse = await github.getIssues(repo).listIssues();
        setIssues(issuesResponse.data);
      } catch (error) {
        console.error('Error fetching issues:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [repo]);

  return { issues, loading };
};

export default useGitHubIssues;
