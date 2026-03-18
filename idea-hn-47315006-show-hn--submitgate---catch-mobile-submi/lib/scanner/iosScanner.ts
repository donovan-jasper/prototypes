import JSZip from 'jszip';
import * as FileSystem from 'expo-file-system';
import plist from 'plist';
import { ComplianceIssue } from '../types';

interface InfoPlist {
  CFBundleIdentifier?: string;
  CFBundleVersion?: string;
  CFBundleShortVersionString?: string;
  NSPrivacyTracking?: boolean;
  NSPrivacyTrackingDomains?: string[];
  NSAppTransportSecurity?: {
    NSAllowsArbitraryLoads?: boolean;
    NSExceptionDomains?: Record<string, any>;
  };
  UIRequiredDeviceCapabilities?: string[];
  CFBundleIcons?: any;
  CFBundleIconFiles?: string[];
}

const REQUIRED_ICON_SIZES = [
  { name: 'AppIcon60x60@2x.png', size: '120x120', description: 'iPhone App Icon (2x)' },
  { name: 'AppIcon60x60@3x.png', size: '180x180', description: 'iPhone App Icon (3x)' },
  { name: 'AppIcon76x76@2x.png', size: '152x152', description: 'iPad App Icon (2x)' },
  { name: 'AppIcon83.5x83.5@2x.png', size: '167x167', description: 'iPad Pro App Icon' },
  { name: 'AppIcon1024x1024.png', size: '1024x1024', description: 'App Store Icon' },
];

export async function scanIOS(fileUri: string): Promise<ComplianceIssue[]> {
  const issues: ComplianceIssue[] = [];

  try {
    // Read the IPA file
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Load the IPA as a zip
    const zip = await JSZip.loadAsync(fileContent, { base64: true });

    // Find the .app directory inside Payload/
    const payloadFiles = Object.keys(zip.files).filter(name => name.startsWith('Payload/'));
    const appDirMatch = payloadFiles.find(name => name.match(/Payload\/[^/]+\.app\//));

    if (!appDirMatch) {
      issues.push({
        id: 'ios_invalid_structure',
        ruleId: 'ios_structure',
        title: 'Invalid IPA Structure',
        description: 'Could not find .app directory inside Payload folder',
        severity: 'critical',
        fix: 'Ensure the IPA file is properly structured with a Payload/[AppName].app directory',
      });
      return issues;
    }

    const appDirPrefix = appDirMatch.match(/Payload\/[^/]+\.app\//)?.[0];
    if (!appDirPrefix) {
      return issues;
    }

    // Extract and parse Info.plist
    const infoPlistPath = `${appDirPrefix}Info.plist`;
    const infoPlistFile = zip.files[infoPlistPath];

    if (!infoPlistFile) {
      issues.push({
        id: 'ios_missing_infoplist',
        ruleId: 'ios_infoplist',
        title: 'Missing Info.plist',
        description: 'Info.plist file not found in the app bundle',
        severity: 'critical',
        fix: 'Ensure Info.plist exists in your Xcode project and is included in the build',
      });
      return issues;
    }

    const infoPlistContent = await infoPlistFile.async('string');
    let infoPlist: InfoPlist;

    try {
      infoPlist = plist.parse(infoPlistContent) as InfoPlist;
    } catch (error) {
      issues.push({
        id: 'ios_invalid_infoplist',
        ruleId: 'ios_infoplist',
        title: 'Invalid Info.plist Format',
        description: 'Info.plist could not be parsed',
        severity: 'critical',
        fix: 'Verify that Info.plist is valid XML/plist format',
      });
      return issues;
    }

    // Check required bundle keys
    if (!infoPlist.CFBundleIdentifier) {
      issues.push({
        id: 'ios_missing_bundle_id',
        ruleId: 'ios_bundle_identifier',
        title: 'Missing Bundle Identifier',
        description: 'CFBundleIdentifier is required but not found',
        severity: 'critical',
        fix: 'Add CFBundleIdentifier to Info.plist (e.g., com.company.appname)',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleidentifier',
      });
    }

    if (!infoPlist.CFBundleVersion) {
      issues.push({
        id: 'ios_missing_bundle_version',
        ruleId: 'ios_bundle_version',
        title: 'Missing Bundle Version',
        description: 'CFBundleVersion is required but not found',
        severity: 'critical',
        fix: 'Add CFBundleVersion to Info.plist (e.g., 1.0.0)',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleversion',
      });
    }

    if (!infoPlist.CFBundleShortVersionString) {
      issues.push({
        id: 'ios_missing_short_version',
        ruleId: 'ios_short_version',
        title: 'Missing Short Version String',
        description: 'CFBundleShortVersionString is required but not found',
        severity: 'critical',
        fix: 'Add CFBundleShortVersionString to Info.plist (e.g., 1.0)',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/information_property_list/cfbundleshortversionstring',
      });
    }

    // Check iOS 17+ privacy requirements
    if (infoPlist.NSPrivacyTracking === undefined) {
      issues.push({
        id: 'ios_missing_privacy_tracking',
        ruleId: 'ios_privacy_manifest',
        title: 'Missing NSPrivacyTracking Key',
        description: 'NSPrivacyTracking key required for iOS 17+ to declare tracking status',
        severity: 'critical',
        fix: 'Add NSPrivacyTracking boolean key to Info.plist. Set to true if your app tracks users, false otherwise.',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/privacy_manifest_files',
      });
    }

    if (infoPlist.NSPrivacyTracking === true && (!infoPlist.NSPrivacyTrackingDomains || infoPlist.NSPrivacyTrackingDomains.length === 0)) {
      issues.push({
        id: 'ios_missing_tracking_domains',
        ruleId: 'ios_privacy_tracking_domains',
        title: 'Missing Tracking Domains',
        description: 'NSPrivacyTrackingDomains required when NSPrivacyTracking is true',
        severity: 'critical',
        fix: 'Add NSPrivacyTrackingDomains array to Info.plist listing all domains used for tracking',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/privacy_manifest_files',
      });
    }

    // Check App Transport Security
    if (!infoPlist.NSAppTransportSecurity) {
      issues.push({
        id: 'ios_missing_ats',
        ruleId: 'ios_app_transport_security',
        title: 'App Transport Security Not Configured',
        description: 'NSAppTransportSecurity key not found in Info.plist',
        severity: 'warning',
        fix: 'Add NSAppTransportSecurity dictionary to Info.plist to configure secure network connections. If you need to allow insecure connections, explicitly configure exception domains.',
        documentationUrl: 'https://developer.apple.com/documentation/security/preventing_insecure_network_connections',
      });
    } else if (infoPlist.NSAppTransportSecurity.NSAllowsArbitraryLoads === true) {
      issues.push({
        id: 'ios_ats_arbitrary_loads',
        ruleId: 'ios_app_transport_security',
        title: 'Insecure Network Configuration',
        description: 'NSAllowsArbitraryLoads is set to true, which disables App Transport Security',
        severity: 'warning',
        fix: 'Remove NSAllowsArbitraryLoads or set to false. Use NSExceptionDomains to allow specific insecure domains if needed.',
        documentationUrl: 'https://developer.apple.com/documentation/security/preventing_insecure_network_connections',
      });
    }

    // Check for required device capabilities
    if (!infoPlist.UIRequiredDeviceCapabilities || infoPlist.UIRequiredDeviceCapabilities.length === 0) {
      issues.push({
        id: 'ios_missing_device_capabilities',
        ruleId: 'ios_device_capabilities',
        title: 'Missing Device Capabilities',
        description: 'UIRequiredDeviceCapabilities not specified',
        severity: 'info',
        fix: 'Add UIRequiredDeviceCapabilities array to Info.plist to specify required device features (e.g., armv7, arm64)',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/information_property_list/uirequireddevicecapabilities',
      });
    }

    // Check for app icons
    const iconIssues = await checkAppIcons(zip, appDirPrefix);
    issues.push(...iconIssues);

    // Check for PrivacyInfo.xcprivacy file
    const privacyInfoPath = `${appDirPrefix}PrivacyInfo.xcprivacy`;
    if (!zip.files[privacyInfoPath]) {
      issues.push({
        id: 'ios_missing_privacy_manifest',
        ruleId: 'ios_privacy_manifest_file',
        title: 'Missing Privacy Manifest File',
        description: 'PrivacyInfo.xcprivacy file not found (required for iOS 17+)',
        severity: 'critical',
        fix: 'Add PrivacyInfo.xcprivacy to your Xcode project. This file declares your app\'s privacy practices including data collection and required reasons API usage.',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/privacy_manifest_files',
      });
    }

  } catch (error) {
    issues.push({
      id: 'ios_scan_error',
      ruleId: 'ios_general',
      title: 'Scan Error',
      description: `Failed to scan IPA file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'critical',
      fix: 'Ensure the file is a valid IPA archive and try again',
    });
  }

  return issues;
}

async function checkAppIcons(zip: JSZip, appDirPrefix: string): Promise<ComplianceIssue[]> {
  const issues: ComplianceIssue[] = [];

  for (const iconSpec of REQUIRED_ICON_SIZES) {
    const iconPath = `${appDirPrefix}${iconSpec.name}`;
    if (!zip.files[iconPath]) {
      issues.push({
        id: `ios_missing_icon_${iconSpec.name}`,
        ruleId: 'ios_app_icons',
        title: `Missing Required App Icon: ${iconSpec.description}`,
        description: `App icon ${iconSpec.name} (${iconSpec.size}) not found`,
        severity: iconSpec.name.includes('1024x1024') ? 'critical' : 'warning',
        fix: `Add ${iconSpec.name} (${iconSpec.size} pixels) to your app's asset catalog in Xcode`,
        documentationUrl: 'https://developer.apple.com/design/human-interface-guidelines/app-icons',
      });
    }
  }

  return issues;
}
