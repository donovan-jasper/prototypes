import { Platform } from 'react-native';
import { DigitalWellbeingAPI } from './digitalWellbeingAPI';
import { ScreenTimeAPI } from './screenTimeAPI';
import { getAgeProfile } from '../../constants/ageProfiles';
import { filterURL } from '../../lib/filtering/contentFilter';

export class ContentFilterBridge {
  private digitalWellbeingAPI: DigitalWellbeingAPI;
  private screenTimeAPI: ScreenTimeAPI;
  private currentProfile: string | null = null;

  constructor() {
    this.digitalWellbeingAPI = new DigitalWellbeingAPI();
    this.screenTimeAPI = new ScreenTimeAPI();
  }

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
      return this.digitalWellbeingAPI.enableContentFilter(config);
    } else if (Platform.OS === 'ios') {
      return this.screenTimeAPI.enableContentFilter(config);
    }

    return false;
  }

  /**
   * Disable content filtering
   */
  async disableContentFilter(): Promise<boolean> {
    this.currentProfile = null;

    if (Platform.OS === 'android') {
      return this.digitalWellbeingAPI.disableContentFilter();
    } else if (Platform.OS === 'ios') {
      return this.screenTimeAPI.disableContentFilter();
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
      return this.digitalWellbeingAPI.getStatus();
    } else if (Platform.OS === 'ios') {
      return this.screenTimeAPI.getStatus();
    }

    return {
      available: false,
      enabled: false,
      error: 'Unsupported platform'
    };
  }
}

// Singleton instance
export const contentFilterBridge = new ContentFilterBridge();
