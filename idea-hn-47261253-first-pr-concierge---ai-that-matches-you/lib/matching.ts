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

  // Language match bonus (1-3 points based on language match)
  const issueLanguages = issue.labels.filter(label =>
    profile.languages.includes(label.toLowerCase())
  );

  if (issueLanguages.length > 0) {
    score += 1 * issueLanguages.length;
  }

  // Label presence (bugs are harder than enhancements)
  const hasBugLabel = issue.labels.some(label =>
    label.toLowerCase() === 'bug'
  );

  const hasEnhancementLabel = issue.labels.some(label =>
    label.toLowerCase() === 'enhancement'
  );

  if (hasBugLabel) {
    score += 2; // Bugs are harder
  } else if (hasEnhancementLabel) {
    score += 1; // Enhancements are easier
  }

  // Issue age (older issues are harder)
  const createdAt = new Date(issue.created_at || Date.now());
  const daysOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysOld < 7) {
    score += 1; // Very recent
  } else if (daysOld < 30) {
    score += 0.5; // Recent
  } else if (daysOld < 90) {
    score -= 0.5; // Older
  } else {
    score -= 1; // Very old
  }

  // Comment count (more comments = more discussion = harder)
  if (issue.comments > 0) {
    score += Math.min(1, issue.comments * 0.1); // Cap at 1 point
  }

  // Repository activity (stars and forks indicate active projects)
  const repoStars = issue.repository.stargazers_count;
  const repoForks = issue.repository.forks_count;

  if (repoStars > 1000) {
    score += 1; // Very popular
  } else if (repoStars > 100) {
    score += 0.5; // Popular
  } else if (repoStars < 10) {
    score -= 0.5; // Small project
  }

  if (repoForks > 100) {
    score += 0.5; // Widely used
  }

  // Recent commits (more recent activity = more likely to be maintained)
  const repoUpdatedAt = new Date(issue.repository.updated_at || Date.now());
  const daysSinceUpdate = (Date.now() - repoUpdatedAt.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceUpdate < 7) {
    score += 0.5; // Very active
  } else if (daysSinceUpdate < 30) {
    score += 0.25; // Active
  } else if (daysSinceUpdate > 90) {
    score -= 0.5; // Inactive
  }

  // Normalize score to 1-5 scale
  // Original score range is approximately -2 to 4
  // We'll map this to 1-5
  const normalizedScore = Math.min(5, Math.max(1, Math.round((score + 2) * 5 / 6)));

  return normalizedScore;
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
