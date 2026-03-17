import { Issue, Repository } from '../types';

interface UserProfile {
  languages: string[];
  contributionCount: number;
  recentActivity: number;
}

export const analyzeUserProfile = (repos: Repository[]): UserProfile => {
  // Count language usage across repositories
  const languageCounts: Record<string, number> = {};
  let totalContributions = 0;

  repos.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      totalContributions += repo.stargazers_count + repo.forks_count;
    }
  });

  // Get top 3 languages
  const languages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([lang]) => lang.toLowerCase());

  // Calculate recent activity (simplified)
  const recentActivity = repos.reduce((sum, repo) => {
    const updatedAt = new Date(repo.updated_at || Date.now());
    const daysSinceUpdate = (Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    return sum + (daysSinceUpdate < 30 ? 1 : 0);
  }, 0);

  return {
    languages,
    contributionCount: totalContributions,
    recentActivity
  };
};

export const scoreIssue = (issue: Issue, profile: UserProfile): number => {
  let score = 0;

  // Language match bonus
  const issueLanguages = issue.labels.filter(label =>
    profile.languages.includes(label.toLowerCase())
  );

  if (issueLanguages.length > 0) {
    score += 30 * issueLanguages.length;
  }

  // Beginner-friendly labels
  const beginnerLabels = ['good-first-issue', 'first-timers-only', 'beginner-friendly'];
  const hasBeginnerLabel = issue.labels.some(label =>
    beginnerLabels.includes(label.toLowerCase())
  );

  if (hasBeginnerLabel) {
    score += 20;
  }

  // Repository size (smaller repos are less intimidating)
  if (issue.repository.stargazers_count < 100) {
    score += 10;
  }

  // Freshness (newer issues are more likely to be maintained)
  const createdAt = new Date(issue.created_at || Date.now());
  const daysOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysOld < 30) {
    score += 15;
  } else if (daysOld < 90) {
    score += 5;
  }

  // Adjust for user experience level
  if (profile.contributionCount < 5) {
    // New contributors get extra points for beginner issues
    if (hasBeginnerLabel) {
      score += 15;
    }
  } else if (profile.contributionCount < 20) {
    // Intermediate contributors get points for non-beginner issues
    if (!hasBeginnerLabel) {
      score += 10;
    }
  }

  // Penalize stale issues
  if (daysOld > 90) {
    score -= 10;
  }

  return Math.max(0, score); // Ensure score is not negative
};

export const rankIssues = (issues: Issue[], profile: UserProfile): Issue[] => {
  // Calculate scores for all issues
  const scoredIssues = issues.map(issue => ({
    issue,
    score: scoreIssue(issue, profile)
  }));

  // Sort by score (descending)
  scoredIssues.sort((a, b) => b.score - a.score);

  // Return top 10 issues
  return scoredIssues.slice(0, 10).map(item => item.issue);
};

export const fetchGoodFirstIssues = async (repos: Repository[]): Promise<Issue[]> => {
  // In a real implementation, this would call the GitHub API
  // For now, we'll simulate it with some mock data

  const mockIssues: Issue[] = [
    {
      id: 1,
      title: "Fix typo in README",
      url: "https://github.com/example/repo/issues/1",
      labels: ["documentation", "good-first-issue"],
      repository: {
        name: "example-repo",
        owner: "example",
        url: "https://github.com/example/repo"
      },
      difficulty: 1,
      created_at: new Date(Date.now() - 86400000).toISOString() // 1 day old
    },
    {
      id: 2,
      title: "Add test cases for utility functions",
      url: "https://github.com/example/repo/issues/2",
      labels: ["testing", "javascript"],
      repository: {
        name: "example-repo",
        owner: "example",
        url: "https://github.com/example/repo"
      },
      difficulty: 2,
      created_at: new Date(Date.now() - 259200000).toISOString() // 3 days old
    },
    {
      id: 3,
      title: "Improve error handling in API client",
      url: "https://github.com/example/repo/issues/3",
      labels: ["bug", "typescript"],
      repository: {
        name: "example-repo",
        owner: "example",
        url: "https://github.com/example/repo"
      },
      difficulty: 3,
      created_at: new Date(Date.now() - 604800000).toISOString() // 7 days old
    },
    {
      id: 4,
      title: "Update dependencies to latest versions",
      url: "https://github.com/example/repo/issues/4",
      labels: ["dependencies", "maintenance"],
      repository: {
        name: "example-repo",
        owner: "example",
        url: "https://github.com/example/repo"
      },
      difficulty: 2,
      created_at: new Date(Date.now() - 1209600000).toISOString() // 14 days old
    },
    {
      id: 5,
      title: "Add dark mode support",
      url: "https://github.com/example/repo/issues/5",
      labels: ["feature", "css", "good-first-issue"],
      repository: {
        name: "example-repo",
        owner: "example",
        url: "https://github.com/example/repo"
      },
      difficulty: 2,
      created_at: new Date(Date.now() - 1728000000).toISOString() // 20 days old
    }
  ];

  // Filter issues based on user's languages
  const userProfile = analyzeUserProfile(repos);
  return mockIssues.filter(issue =>
    issue.labels.some(label =>
      userProfile.languages.includes(label.toLowerCase()) ||
      label.toLowerCase().includes('good-first-issue')
    )
  );
};
