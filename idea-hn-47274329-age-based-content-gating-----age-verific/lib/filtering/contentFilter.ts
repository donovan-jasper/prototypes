import { getAgeProfile } from '../../constants/ageProfiles';
import { adultDomains, violenceDomains, gamblingDomains, socialMediaDomains } from './blocklists';
import { keywordBlocklist } from './blocklists';

export interface FilterResult {
  blocked: boolean;
  reason?: 'domain_blocklist' | 'keyword' | 'image_analysis' | 'profile_restriction';
  matchedItem?: string;
}

export function filterURL(url: string, profileType: string): FilterResult {
  const profile = getAgeProfile(profileType);
  if (!profile) {
    return { blocked: false };
  }

  // Check allowed domains first (whitelist)
  if (profile.allowedDomains && profile.allowedDomains.length > 0) {
    const domain = extractDomain(url);
    if (profile.allowedDomains.some(allowed => domain.includes(allowed))) {
      return { blocked: false };
    }
  }

  // Check blocked domains
  const domain = extractDomain(url);

  if (profile.blockAdultContent && adultDomains.some(blocked => domain.includes(blocked))) {
    return { blocked: true, reason: 'domain_blocklist', matchedItem: domain };
  }

  if (profile.blockViolence && violenceDomains.some(blocked => domain.includes(blocked))) {
    return { blocked: true, reason: 'domain_blocklist', matchedItem: domain };
  }

  if (profile.blockGambling && gamblingDomains.some(blocked => domain.includes(blocked))) {
    return { blocked: true, reason: 'domain_blocklist', matchedItem: domain };
  }

  if (profile.blockSocialMedia && socialMediaDomains.some(blocked => domain.includes(blocked))) {
    return { blocked: true, reason: 'domain_blocklist', matchedItem: domain };
  }

  // Check custom blocked domains if any
  if (profile.blockedDomains && profile.blockedDomains.length > 0) {
    if (profile.blockedDomains.some(blocked => domain.includes(blocked))) {
      return { blocked: true, reason: 'domain_blocklist', matchedItem: domain };
    }
  }

  return { blocked: false };
}

export function filterSearchQuery(query: string, profileType: string): FilterResult {
  const profile = getAgeProfile(profileType);
  if (!profile) {
    return { blocked: false };
  }

  if (!profile.restrictWebSearch) {
    return { blocked: false };
  }

  const lowerQuery = query.toLowerCase();

  for (const keyword of keywordBlocklist) {
    if (lowerQuery.includes(keyword)) {
      return { blocked: true, reason: 'keyword', matchedItem: keyword };
    }
  }

  return { blocked: false };
}

export function analyzeImage(imageUri: string): Promise<FilterResult> {
  // Placeholder for actual image analysis implementation
  // This would use a TensorFlow Lite model for NSFW detection
  return new Promise((resolve) => {
    // Simulate async operation
    setTimeout(() => {
      // For demo purposes, we'll randomly block some images
      const shouldBlock = Math.random() > 0.7; // 30% chance of blocking
      resolve({
        blocked: shouldBlock,
        reason: 'image_analysis',
        matchedItem: shouldBlock ? 'explicit_content' : undefined
      });
    }, 100);
  });
}

function extractDomain(url: string): string {
  try {
    // Simple domain extraction - would need more robust implementation for production
    const domain = new URL(url).hostname;
    // Remove www. prefix if present
    return domain.replace(/^www\./, '');
  } catch (e) {
    // If URL parsing fails, return the original string
    return url;
  }
}
