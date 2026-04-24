import { AuthCredentials, RepositoryInfo } from '../git/GitProviderService';

export class BitbucketAPI {
  private baseUrl = 'https://api.bitbucket.org/2.0';
  private clientId = 'YOUR_BITBUCKET_CLIENT_ID'; // Replace with actual client ID
  private clientSecret = 'YOUR_BITBUCKET_CLIENT_SECRET'; // Replace with actual client secret

  async getAuthUrl(): Promise<string> {
    const redirectUri = 'YOUR_REDIRECT_URI'; // Replace with actual redirect URI
    return `https://bitbucket.org/site/oauth2/authorize?client_id=${this.clientId}&response_type=code`;
  }

  async handleAuthCallback(code: string): Promise<string> {
    const response = await fetch('https://bitbucket.org/site/oauth2/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret
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
    const match = url.match(/bitbucket\.org\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid Bitbucket repository URL');
    }

    const [, owner, repo] = match;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/repositories/${owner}/${repo}`, {
      headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch repository information');
    }

    const data = await response.json();

    return {
      id: data.uuid,
      name: data.name,
      fullName: data.full_name,
      cloneUrl: data.links.clone.find((c: any) => c.name === 'https').href,
      defaultBranch: data.mainbranch.name,
      private: data.is_private
    };
  }
}
