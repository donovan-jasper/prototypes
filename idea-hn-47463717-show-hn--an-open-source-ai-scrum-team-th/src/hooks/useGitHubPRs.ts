import { useState } from 'react';
import { Octokit } from '@octokit/rest';

interface PRReviewResponse {
  success: boolean;
  message: string;
}

const useGitHubPRs = (token: string) => {
  const [loading, setLoading] = useState(false);
  const octokit = new Octokit({ auth: token });

  const approvePR = async (owner: string, repo: string, prNumber: number): Promise<PRReviewResponse> => {
    setLoading(true);
    try {
      const response = await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
        owner,
        repo,
        pull_number: prNumber,
        event: 'APPROVE',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (response.status === 200) {
        return {
          success: true,
          message: 'Pull Request approved successfully!'
        };
      } else {
        throw new Error('Failed to approve PR');
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to approve PR'
      };
    } finally {
      setLoading(false);
    }
  };

  const rejectPR = async (owner: string, repo: string, prNumber: number): Promise<PRReviewResponse> => {
    setLoading(true);
    try {
      const response = await octokit.request('POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
        owner,
        repo,
        pull_number: prNumber,
        event: 'REQUEST_CHANGES',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });

      if (response.status === 200) {
        return {
          success: true,
          message: 'Pull Request marked for changes!'
        };
      } else {
        throw new Error('Failed to reject PR');
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reject PR'
      };
    } finally {
      setLoading(false);
    }
  };

  const getPRs = async (owner: string, repo: string) => {
    setLoading(true);
    try {
      const response = await octokit.request('GET /repos/{owner}/{repo}/pulls', {
        owner,
        repo,
        state: 'open',
        sort: 'updated',
        per_page: 50,
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch PRs'
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    approvePR,
    rejectPR,
    getPRs
  };
};

export default useGitHubPRs;
