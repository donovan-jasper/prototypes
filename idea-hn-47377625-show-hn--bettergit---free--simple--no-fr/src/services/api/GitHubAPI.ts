import { AuthCredentials, RepositoryInfo } from '../git/GitProviderService';

export class GitHubAPI {
  private baseUrl = 'https://api.github.com';
  private clientId = 'YOUR_GITHUB_CLIENT_ID'; // Replace with actual client ID
  private clientSecret = 'YOUR_GITHUB_CLIENT_SECRET'; // Replace with actual client secret

  async getAuthUrl(): Promise<string> {
    const redirectUri = 'YOUR_REDIRECT_URI'; // Replace with actual redirect URI
    return `https://github.com/login/oauth/authorize?client_id=${this.clientId}&redirect_uri=${redirectUri}&scope=repo`;
  }

  async handleAuthCallback(code: string): Promise<string> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: 'YOUR_REDIRECT_URI' // Replace with actual redirect URI
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error_description || 'Authentication failed');
    }

    return data.access_token;
  }

  async getRepositoryInfo(url: string, token?: string): Promise<RepositoryInfo> {
    // Extract owner and repo from URL
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }

    const [, owner, repo] = match;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch repository information');
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      cloneUrl: data.clone_url,
      defaultBranch: data.default_branch,
      private: data.private
    };
  }
}
