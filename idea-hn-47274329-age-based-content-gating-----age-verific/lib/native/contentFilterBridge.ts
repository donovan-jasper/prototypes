import { Platform } from 'react-native';
import { digitalWellbeingAPI } from './digitalWellbeingAPI';
import { screenTimeAPI } from './screenTimeAPI';
import { getAgeProfile } from '../../constants/ageProfiles';
import { filterURL } from '../../lib/filtering/contentFilter';

export class ContentFilterBridge {
  private currentProfile: string | null = null;

  /**
   * Enable content filtering for the specified profile
   */
  async enableContentFilter(profileType: 'toddler' | 'kid' | 'teen' | 'adult'): Promise<boolean> {
    const profile = getAgeProfile(profileType);
    if (!profile) {
      console.error('[ContentFilterBridge] Invalid profile type:', profileType);
      return false;
    }

    this.currentProfile = profileType;

    const config = {
      profileType,
      blockAdultContent: profile.blockAdultContent,
      blockExplicitContent: profile.blockExplicitContent,
      allowedDomains: profile.allowedDomains,
      blockedDomains: profile.blockedDomains,
      restrictWebSearch: profile.restrictWebSearch,
      restrictSiri: profile.restrictSiri,
      restrictAssistant: profile.restrictAssistant
    };

    if (Platform.OS === 'android') {
      return digitalWellbeingAPI.enableContentFilter(config);
    } else if (Platform.OS === 'ios') {
      return screenTimeAPI.enableContentFilter(config);
    }

    return false;
  }

  /**
   * Disable content filtering
   */
  async disableContentFilter(): Promise<boolean> {
    this.currentProfile = null;

    if (Platform.OS === 'android') {
      return digitalWellbeingAPI.disableContentFilter();
    } else if (Platform.OS === 'ios') {
      return screenTimeAPI.disableContentFilter();
    }

    return false;
  }

  /**
   * Check if a URL should be blocked based on current profile
   */
  async shouldBlockURL(url: string): Promise<boolean> {
    if (!this.currentProfile) {
      return false;
    }

    try {
      const result = filterURL(url, this.currentProfile);
      return result.blocked;
    } catch (error) {
      console.error('[ContentFilterBridge] Error filtering URL:', error);
      return false;
    }
  }

  /**
   * Get current filtering status
   */
  async getStatus() {
    if (Platform.OS === 'android') {
      return digitalWellbeingAPI.getStatus();
    } else if (Platform.OS === 'ios') {
      return screenTimeAPI.getStatus();
    }

    return {
      available: false,
      enabled: false,
      error: 'Unsupported platform'
    };
  }

  /**
   * Update content filtering rules
   */
  async updateContentFilter(config: Partial<ContentFilterConfig>): Promise<boolean> {
    if (Platform.OS === 'android') {
      return digitalWellbeingAPI.updateContentFilter(config);
    } else if (Platform.OS === 'ios') {
      return screenTimeAPI.updateContentFilter(config);
    }

    return false;
  }
}

// Singleton instance
export const contentFilterBridge = new ContentFilterBridge();
