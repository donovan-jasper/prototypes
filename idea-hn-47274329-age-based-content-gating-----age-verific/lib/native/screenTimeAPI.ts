import { Platform, NativeModules } from 'react-native';

/**
 * iOS Screen Time API wrapper
 * Enables/disables content filtering based on age profiles
 */

export interface ScreenTimeStatus {
  available: boolean;
  enabled: boolean;
  profileType?: string;
  error?: string;
}

export interface ContentFilterConfig {
  profileType: 'toddler' | 'kid' | 'teen' | 'adult';
  blockAdultContent: boolean;
  blockExplicitContent: boolean;
  allowedDomains?: string[];
  blockedDomains?: string[];
  restrictWebSearch: boolean;
  restrictSiri: boolean;
}

class ScreenTimeAPI {
  private isAvailable: boolean = false;
  private currentProfile: string | null = null;

  constructor() {
    if (Platform.OS === 'ios') {
      this.checkAvailability();
    }
  }

  /**
   * Check if Screen Time API is available on this device
   */
  private async checkAvailability(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        const available = await NativeModules.ScreenTimeModule.isAvailable();
        this.isAvailable = available;
      } else {
        this.isAvailable = false;
      }

      if (this.isAvailable) {
        console.log('[ScreenTimeAPI] Screen Time API available');
      } else {
        console.warn('[ScreenTimeAPI] Screen Time API not available on this device');
      }
    } catch (error) {
      console.error('[ScreenTimeAPI] Error checking availability:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Get current Screen Time status
   */
  async getStatus(): Promise<ScreenTimeStatus> {
    if (Platform.OS !== 'ios') {
      return {
        available: false,
        enabled: false,
        error: 'Screen Time API only available on iOS'
      };
    }

    try {
      const status = await NativeModules.ScreenTimeModule.getStatus();
      return {
        available: this.isAvailable,
        enabled: status.enabled,
        profileType: status.profileType
      };
    } catch (error) {
      return {
        available: false,
        enabled: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Enable content filtering with specified profile
   */
  async enableContentFilter(config: ContentFilterConfig): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.warn('[ScreenTimeAPI] Screen Time API only available on iOS');
      return false;
    }

    if (!this.isAvailable) {
      console.error('[ScreenTimeAPI] Screen Time API not available');
      return false;
    }

    try {
      console.log('[ScreenTimeAPI] Enabling content filter:', config.profileType);

      const success = await NativeModules.ScreenTimeModule.enableContentFilter({
        profileType: config.profileType,
        blockAdultContent: config.blockAdultContent,
        blockExplicitContent: config.blockExplicitContent,
        allowedDomains: config.allowedDomains || [],
        blockedDomains: config.blockedDomains || [],
        restrictWebSearch: config.restrictWebSearch,
        restrictSiri: config.restrictSiri
      });

      if (success) {
        this.currentProfile = config.profileType;
        console.log('[ScreenTimeAPI] Content filter enabled successfully');
        console.log('[ScreenTimeAPI] Configuration:', {
          profileType: config.profileType,
          blockAdultContent: config.blockAdultContent,
          blockExplicitContent: config.blockExplicitContent,
          allowedDomainsCount: config.allowedDomains?.length || 0,
          blockedDomainsCount: config.blockedDomains?.length || 0,
          restrictWebSearch: config.restrictWebSearch,
          restrictSiri: config.restrictSiri
        });
      }

      return success;
    } catch (error) {
      console.error('[ScreenTimeAPI] Error enabling content filter:', error);
      return false;
    }
  }

  /**
   * Disable content filtering
   */
  async disableContentFilter(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.warn('[ScreenTimeAPI] Screen Time API only available on iOS');
      return false;
    }

    if (!this.isAvailable) {
      console.error('[ScreenTimeAPI] Screen Time API not available');
      return false;
    }

    try {
      console.log('[ScreenTimeAPI] Disabling content filter');

      const success = await NativeModules.ScreenTimeModule.disableContentFilter();

      if (success) {
        this.currentProfile = null;
        console.log('[ScreenTimeAPI] Content filter disabled successfully');
      }

      return success;
    } catch (error) {
      console.error('[ScreenTimeAPI] Error disabling content filter:', error);
      return false;
    }
  }

  /**
   * Update content filtering rules
   */
  async updateContentFilter(config: Partial<ContentFilterConfig>): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.warn('[ScreenTimeAPI] Screen Time API only available on iOS');
      return false;
    }

    if (!this.isAvailable) {
      console.error('[ScreenTimeAPI] Screen Time API not available');
      return false;
    }

    try {
      console.log('[ScreenTimeAPI] Updating content filter');

      const success = await NativeModules.ScreenTimeModule.updateContentFilter(config);

      if (success) {
        console.log('[ScreenTimeAPI] Content filter updated successfully');
        console.log('[ScreenTimeAPI] Updated configuration:', config);
      }

      return success;
    } catch (error) {
      console.error('[ScreenTimeAPI] Error updating content filter:', error);
      return false;
    }
  }
}

export const screenTimeAPI = new ScreenTimeAPI();
