import { GitHubAPI } from '../api/GitHubAPI';
import { GitLabAPI } from '../api/GitLabAPI';
import { BitbucketAPI } from '../api/BitbucketAPI';

export type GitProvider = 'github' | 'gitlab' | 'bitbucket';

export interface AuthCredentials {
  provider: GitProvider;
  token: string;
  username?: string;
}

export interface RepositoryInfo {
  id: string;
  name: string;
  fullName: string;
  cloneUrl: string;
  defaultBranch: string;
  private: boolean;
}

export class GitProviderService {
  private static providers = {
    github: new GitHubAPI(),
    gitlab: new GitLabAPI(),
    bitbucket: new BitbucketAPI()
  };

  static async validateRepositoryUrl(url: string): Promise<boolean> {
    // Basic URL validation
    if (!url.startsWith('http') && !url.startsWith('git@')) {
      return false;
    }

    // Check if URL matches any provider's pattern
    const providerPatterns = [
      /github\.com\/[^\/]+\/[^\/]+/,
      /gitlab\.com\/[^\/]+\/[^\/]+/,
      /bitbucket\.org\/[^\/]+\/[^\/]+/
    ];

    return providerPatterns.some(pattern => pattern.test(url));
  }

  static async getRepositoryInfo(url: string, credentials?: AuthCredentials): Promise<RepositoryInfo> {
    const provider = this.detectProvider(url);
    if (!provider) {
      throw new Error('Unsupported Git provider');
    }

    const api = this.providers[provider];
    return await api.getRepositoryInfo(url, credentials?.token);
  }

  static async getAuthUrl(provider: GitProvider): Promise<string> {
    const api = this.providers[provider];
    return await api.getAuthUrl();
  }

  static async handleAuthCallback(provider: GitProvider, code: string): Promise<AuthCredentials> {
    const api = this.providers[provider];
    const token = await api.handleAuthCallback(code);
    return { provider, token };
  }

  private static detectProvider(url: string): GitProvider | null {
    if (url.includes('github.com')) return 'github';
    if (url.includes('gitlab.com')) return 'gitlab';
    if (url.includes('bitbucket.org')) return 'bitbucket';
    return null;
  }
}
