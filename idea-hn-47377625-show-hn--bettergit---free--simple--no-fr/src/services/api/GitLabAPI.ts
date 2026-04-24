import { AuthCredentials, RepositoryInfo } from '../git/GitProviderService';

export class GitLabAPI {
  private baseUrl = 'https://gitlab.com/api/v4';
  private clientId = 'YOUR_GITLAB_CLIENT_ID'; // Replace with actual client ID
  private clientSecret = 'YOUR_GITLAB_CLIENT_SECRET'; // Replace with actual client secret

  async getAuthUrl(): Promise<string> {
    const redirectUri = 'YOUR_REDIRECT_URI'; // Replace with actual redirect URI
    return `https://gitlab.com/oauth/authorize?client_id=${this.clientId}&redirect_uri=${redirectUri}&response_type=code&scope=api`;
  }

  async handleAuthCallback(code: string): Promise<string> {
    const response = await fetch('https://gitlab.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
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
    const match = url.match(/gitlab\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitLab repository URL');
    }

    const [, owner, repo] = match;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/projects/${encodeURIComponent(`${owner}/${repo}`)}`, {
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch repository information');
    }

    const data = await response.json();

    return {
      id: data.id,
      name: data.name,
      fullName: data.path_with_namespace,
      cloneUrl: data.http_url_to_repo,
      defaultBranch: data.default_branch,
      private: data.visibility === 'private'
    };
  }
}
