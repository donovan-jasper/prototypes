import { Platform, NativeModules } from 'react-native';

/**
 * Android Digital Wellbeing API wrapper
 * Enables/disables content filtering based on age profiles
 */

export interface DigitalWellbeingStatus {
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
  restrictAssistant: boolean;
}

class DigitalWellbeingAPI {
  private isAvailable: boolean = false;
  private currentProfile: string | null = null;

  constructor() {
    if (Platform.OS === 'android') {
      this.checkAvailability();
    }
  }

  /**
   * Check if Digital Wellbeing API is available on this device
   */
  private async checkAvailability(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        const available = await NativeModules.DigitalWellbeingModule.isAvailable();
        this.isAvailable = available;
      } else {
        this.isAvailable = false;
      }

      if (this.isAvailable) {
        console.log('[DigitalWellbeingAPI] Digital Wellbeing API available');
      } else {
        console.warn('[DigitalWellbeingAPI] Digital Wellbeing API not available on this device');
      }
    } catch (error) {
      console.error('[DigitalWellbeingAPI] Error checking availability:', error);
      this.isAvailable = false;
    }
  }

  /**
   * Get current Digital Wellbeing status
   */
  async getStatus(): Promise<DigitalWellbeingStatus> {
    if (Platform.OS !== 'android') {
      return {
        available: false,
        enabled: false,
        error: 'Digital Wellbeing API only available on Android'
      };
    }

    try {
      const status = await NativeModules.DigitalWellbeingModule.getStatus();
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
    if (Platform.OS !== 'android') {
      console.warn('[DigitalWellbeingAPI] Digital Wellbeing API only available on Android');
      return false;
    }

    if (!this.isAvailable) {
      console.error('[DigitalWellbeingAPI] Digital Wellbeing API not available');
      return false;
    }

    try {
      console.log('[DigitalWellbeingAPI] Enabling content filter:', config.profileType);

      const success = await NativeModules.DigitalWellbeingModule.enableContentFilter({
        profileType: config.profileType,
        blockAdultContent: config.blockAdultContent,
        blockExplicitContent: config.blockExplicitContent,
        allowedDomains: config.allowedDomains || [],
        blockedDomains: config.blockedDomains || [],
        restrictWebSearch: config.restrictWebSearch,
        restrictAssistant: config.restrictAssistant
      });

      if (success) {
        this.currentProfile = config.profileType;
        console.log('[DigitalWellbeingAPI] Content filter enabled successfully');
        console.log('[DigitalWellbeingAPI] Configuration:', {
          profileType: config.profileType,
          blockAdultContent: config.blockAdultContent,
          blockExplicitContent: config.blockExplicitContent,
          allowedDomainsCount: config.allowedDomains?.length || 0,
          blockedDomainsCount: config.blockedDomains?.length || 0,
          restrictWebSearch: config.restrictWebSearch,
          restrictAssistant: config.restrictAssistant
        });
      }

      return success;
    } catch (error) {
      console.error('[DigitalWellbeingAPI] Error enabling content filter:', error);
      return false;
    }
  }

  /**
   * Disable content filtering
   */
  async disableContentFilter(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('[DigitalWellbeingAPI] Digital Wellbeing API only available on Android');
      return false;
    }

    if (!this.isAvailable) {
      console.error('[DigitalWellbeingAPI] Digital Wellbeing API not available');
      return false;
    }

    try {
      console.log('[DigitalWellbeingAPI] Disabling content filter');

      const success = await NativeModules.DigitalWellbeingModule.disableContentFilter();

      if (success) {
        this.currentProfile = null;
        console.log('[DigitalWellbeingAPI] Content filter disabled successfully');
      }

      return success;
    } catch (error) {
      console.error('[DigitalWellbeingAPI] Error disabling content filter:', error);
      return false;
    }
  }

  /**
   * Update content filtering rules
   */
  async updateContentFilter(config: Partial<ContentFilterConfig>): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.warn('[DigitalWellbeingAPI] Digital Wellbeing API only available on Android');
      return false;
    }

    if (!this.isAvailable) {
      console.error('[DigitalWellbeingAPI] Digital Wellbeing API not available');
      return false;
    }

    try {
      console.log('[DigitalWellbeingAPI] Updating content filter');

      const success = await NativeModules.DigitalWellbeingModule.updateContentFilter(config);

      if (success) {
        console.log('[DigitalWellbeingAPI] Content filter updated successfully');
        console.log('[DigitalWellbeingAPI] Updated configuration:', config);
      }

      return success;
    } catch (error) {
      console.error('[DigitalWellbeingAPI] Error updating content filter:', error);
      return false;
    }
  }
}

export const digitalWellbeingAPI = new DigitalWellbeingAPI();
