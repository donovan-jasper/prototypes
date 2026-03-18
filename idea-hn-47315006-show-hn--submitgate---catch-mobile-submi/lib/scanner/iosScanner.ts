import JSZip from 'jszip';
import plist from 'plist';
import * as FileSystem from 'expo-file-system';
import { ComplianceIssue } from '../types';

interface InfoPlist {
  CFBundleIdentifier?: string;
  CFBundleVersion?: string;
  CFBundleShortVersionString?: string;
  NSPrivacyTracking?: boolean;
  NSPrivacyTrackingDomains?: string[];
  CFBundleIcons?: any;
  CFBundleIconFiles?: string[];
  UIRequiredDeviceCapabilities?: string[];
  NSAppTransportSecurity?: any;
}

export async function scanIPA(fileUri: string): Promise<ComplianceIssue[]> {
  const issues: ComplianceIssue[] = [];

  try {
    // Read the IPA file
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Load as zip
    const zip = await JSZip.loadAsync(fileContent, { base64: true });

    // Find Info.plist (usually in Payload/*.app/Info.plist)
    let infoPlistFile: JSZip.JSZipObject | null = null;
    let appDirectory = '';

    zip.forEach((relativePath, file) => {
      if (relativePath.match(/Payload\/[^/]+\.app\/Info\.plist$/)) {
        infoPlistFile = file;
        appDirectory = relativePath.replace(/Info\.plist$/, '');
      }
    });

    if (!infoPlistFile) {
      issues.push({
        id: 'ios_no_infoplist',
        ruleId: 'ios_infoplist_required',
        title: 'Info.plist Not Found',
        description: 'The IPA file does not contain a valid Info.plist file in the expected location.',
        severity: 'critical',
        fix: 'Ensure your Xcode project includes an Info.plist file and that the IPA was built correctly.',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/information_property_list',
      });
      return issues;
    }

    // Parse Info.plist
    const plistContent = await infoPlistFile.async('text');
    const infoPlist = plist.parse(plistContent) as InfoPlist;

    // Check for required keys
    if (!infoPlist.CFBundleIdentifier) {
      issues.push({
        id: 'ios_missing_bundle_id',
        ruleId: 'ios_bundle_identifier_required',
        title: 'Missing Bundle Identifier',
        description: 'CFBundleIdentifier is required but not found in Info.plist.',
        severity: 'critical',
        fix: 'Add CFBundleIdentifier to your Info.plist:\n<key>CFBundleIdentifier</key>\n<string>com.yourcompany.yourapp</string>',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleidentifier',
      });
    }

    if (!infoPlist.CFBundleVersion) {
      issues.push({
        id: 'ios_missing_bundle_version',
        ruleId: 'ios_bundle_version_required',
        title: 'Missing Bundle Version',
        description: 'CFBundleVersion is required but not found in Info.plist.',
        severity: 'critical',
        fix: 'Add CFBundleVersion to your Info.plist:\n<key>CFBundleVersion</key>\n<string>1</string>',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleversion',
      });
    }

    if (!infoPlist.CFBundleShortVersionString) {
      issues.push({
        id: 'ios_missing_short_version',
        ruleId: 'ios_short_version_required',
        title: 'Missing Short Version String',
        description: 'CFBundleShortVersionString is required but not found in Info.plist.',
        severity: 'critical',
        fix: 'Add CFBundleShortVersionString to your Info.plist:\n<key>CFBundleShortVersionString</key>\n<string>1.0</string>',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleshortversionstring',
      });
    }

    // Check for privacy tracking declaration (iOS 14.5+)
    if (infoPlist.NSPrivacyTracking === undefined) {
      issues.push({
        id: 'ios_missing_privacy_tracking',
        ruleId: 'ios_privacy_tracking_required',
        title: 'Missing Privacy Tracking Declaration',
        description: 'NSPrivacyTracking key is missing. Apps must declare if they track users for advertising or data broker purposes.',
        severity: 'warning',
        fix: 'Add NSPrivacyTracking to your Info.plist:\n<key>NSPrivacyTracking</key>\n<false/>\n\nSet to true only if your app tracks users across apps/websites.',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/information_property_list/nsprivacytracking',
      });
    }

    // Check for privacy manifest (iOS 17+)
    let hasPrivacyManifest = false;
    zip.forEach((relativePath) => {
      if (relativePath.includes('PrivacyInfo.xcprivacy')) {
        hasPrivacyManifest = true;
      }
    });

    if (!hasPrivacyManifest) {
      issues.push({
        id: 'ios_missing_privacy_manifest',
        ruleId: 'ios_privacy_manifest_required',
        title: 'Privacy Manifest Not Found',
        description: 'iOS 17+ requires a PrivacyInfo.xcprivacy file for apps using certain APIs.',
        severity: 'critical',
        fix: 'Add a PrivacyInfo.xcprivacy file to your Xcode project. Go to File > New > File, search for "App Privacy", and configure required API usage declarations.',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/privacy_manifest_files',
      });
    }

    // Check for app icons
    const iconFiles: string[] = [];
    zip.forEach((relativePath) => {
      if (relativePath.startsWith(appDirectory) && 
          (relativePath.includes('AppIcon') || relativePath.match(/Icon.*\.png$/i))) {
        iconFiles.push(relativePath);
      }
    });

    if (iconFiles.length === 0) {
      issues.push({
        id: 'ios_missing_icons',
        ruleId: 'ios_app_icons_required',
        title: 'App Icons Not Found',
        description: 'No app icon files were detected in the IPA bundle.',
        severity: 'critical',
        fix: 'Add app icons to your Xcode project using an Asset Catalog. Ensure you have icons for all required sizes (20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt, 1024pt).',
        documentationUrl: 'https://developer.apple.com/design/human-interface-guidelines/app-icons',
      });
    } else if (iconFiles.length < 7) {
      issues.push({
        id: 'ios_incomplete_icons',
        ruleId: 'ios_app_icons_incomplete',
        title: 'Incomplete App Icon Set',
        description: `Only ${iconFiles.length} icon file(s) found. iOS requires icons for multiple sizes.`,
        severity: 'warning',
        fix: 'Ensure your Asset Catalog includes all required icon sizes: 20pt, 29pt, 40pt, 60pt, 76pt, 83.5pt (iPad Pro), and 1024pt (App Store).',
        documentationUrl: 'https://developer.apple.com/design/human-interface-guidelines/app-icons',
      });
    }

    // Check for App Transport Security
    if (!infoPlist.NSAppTransportSecurity) {
      issues.push({
        id: 'ios_missing_ats',
        ruleId: 'ios_ats_configuration',
        title: 'App Transport Security Not Configured',
        description: 'NSAppTransportSecurity is not defined. This may cause network requests to fail.',
        severity: 'info',
        fix: 'Add NSAppTransportSecurity to Info.plist if your app makes network requests:\n<key>NSAppTransportSecurity</key>\n<dict>\n  <key>NSAllowsArbitraryLoads</key>\n  <false/>\n</dict>',
        documentationUrl: 'https://developer.apple.com/documentation/security/preventing_insecure_network_connections',
      });
    }

    // Check for required device capabilities
    if (!infoPlist.UIRequiredDeviceCapabilities || 
        (Array.isArray(infoPlist.UIRequiredDeviceCapabilities) && 
         infoPlist.UIRequiredDeviceCapabilities.length === 0)) {
      issues.push({
        id: 'ios_missing_capabilities',
        ruleId: 'ios_device_capabilities',
        title: 'Device Capabilities Not Specified',
        description: 'UIRequiredDeviceCapabilities is empty or missing. This may affect device compatibility.',
        severity: 'info',
        fix: 'Add UIRequiredDeviceCapabilities to Info.plist to specify required hardware features:\n<key>UIRequiredDeviceCapabilities</key>\n<array>\n  <string>arm64</string>\n</array>',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/information_property_list/uirequireddevicecapabilities',
      });
    }

  } catch (error) {
    issues.push({
      id: 'ios_scan_error',
      ruleId: 'ios_scan_failed',
      title: 'Scan Failed',
      description: `Failed to scan IPA file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'critical',
      fix: 'Ensure the file is a valid IPA archive. Try rebuilding your app in Xcode and exporting a new IPA.',
    });
  }

  return issues;
}
