import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';
import plist from 'plist';
import { ComplianceIssue } from '../types';
import { getRules } from '../database';

export const scanIPA = async (fileUri: string): Promise<ComplianceIssue[]> => {
  try {
    // Read the IPA file
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Load the IPA as a ZIP file
    const zip = await JSZip.loadAsync(fileContent, { base64: true });
    const issues: ComplianceIssue[] = [];

    // Get iOS compliance rules
    const rules = await getRules('ios');

    // Check for Payload directory
    const payloadDir = zip.folder('Payload');
    if (!payloadDir) {
      issues.push({
        id: `issue-${Date.now()}`,
        ruleId: 'ios_missing_payload',
        title: 'Missing Payload Directory',
        description: 'The IPA file is missing the required Payload directory',
        severity: 'critical',
        fix: 'Recreate the IPA file using Xcode Archive → Export',
        documentationUrl: 'https://developer.apple.com/documentation/xcode/creating-an-archive-of-your-app'
      });
      return issues;
    }

    // Get the first app directory in Payload
    const appDirName = Object.keys(payloadDir.files).find(name => name.endsWith('.app'));
    if (!appDirName) {
      issues.push({
        id: `issue-${Date.now()}`,
        ruleId: 'ios_missing_app_dir',
        title: 'Missing App Directory',
        description: 'The IPA file is missing the .app directory inside Payload',
        severity: 'critical',
        fix: 'Recreate the IPA file using Xcode Archive → Export',
        documentationUrl: 'https://developer.apple.com/documentation/xcode/creating-an-archive-of-your-app'
      });
      return issues;
    }

    const appDir = payloadDir.folder(appDirName);
    if (!appDir) {
      issues.push({
        id: `issue-${Date.now()}`,
        ruleId: 'ios_invalid_app_dir',
        title: 'Invalid App Directory',
        description: 'The .app directory inside Payload is invalid',
        severity: 'critical',
        fix: 'Recreate the IPA file using Xcode Archive → Export',
        documentationUrl: 'https://developer.apple.com/documentation/xcode/creating-an-archive-of-your-app'
      });
      return issues;
    }

    // Parse Info.plist
    const infoPlistFile = appDir.file('Info.plist');
    if (!infoPlistFile) {
      issues.push({
        id: `issue-${Date.now()}`,
        ruleId: 'ios_missing_info_plist',
        title: 'Missing Info.plist',
        description: 'The app bundle is missing the required Info.plist file',
        severity: 'critical',
        fix: 'Ensure your Xcode project has a properly configured Info.plist file',
        documentationUrl: 'https://developer.apple.com/documentation/bundleresources/information_property_list'
      });
    } else {
      const infoPlistContent = await infoPlistFile.async('text');
      const infoPlist = plist.parse(infoPlistContent);

      // Check required fields
      const requiredFields = [
        { key: 'CFBundleIdentifier', title: 'Bundle Identifier' },
        { key: 'CFBundleVersion', title: 'Bundle Version' },
        { key: 'CFBundleShortVersionString', title: 'Version String' },
        { key: 'CFBundleDisplayName', title: 'Display Name' },
      ];

      requiredFields.forEach(field => {
        if (!infoPlist[field.key]) {
          issues.push({
            id: `issue-${Date.now()}`,
            ruleId: `ios_missing_${field.key.toLowerCase()}`,
            title: `Missing ${field.title}`,
            description: `The Info.plist is missing the required ${field.key} field`,
            severity: 'critical',
            fix: `Add the ${field.key} field to your Info.plist file`,
            documentationUrl: 'https://developer.apple.com/documentation/bundleresources/information_property_list'
          });
        }
      });

      // Check for privacy manifest (iOS 17+)
      const privacyManifestFile = appDir.file('PrivacyInfo.xcprivacy');
      if (!privacyManifestFile) {
        issues.push({
          id: `issue-${Date.now()}`,
          ruleId: 'ios_missing_privacy_manifest',
          title: 'Missing Privacy Manifest',
          description: 'The app bundle is missing the required PrivacyInfo.xcprivacy file for iOS 17+',
          severity: 'critical',
          fix: 'Add a PrivacyInfo.xcprivacy file to your Xcode project',
          documentationUrl: 'https://developer.apple.com/documentation/bundleresources/privacy_manifest_files'
        });
      }

      // Check icon files
      const iconFiles = [
        'AppIcon60x60@2x.png',
        'AppIcon60x60@3x.png',
        'AppIcon83.5x83.5@2x.png',
        'AppIcon1024x1024@1x.png'
      ];

      iconFiles.forEach(icon => {
        if (!appDir.file(`Assets.xcassets/AppIcon.appiconset/${icon}`)) {
          issues.push({
            id: `issue-${Date.now()}`,
            ruleId: `ios_missing_icon_${icon}`,
            title: `Missing Icon: ${icon}`,
            description: `The app bundle is missing the required icon file: ${icon}`,
            severity: 'warning',
            fix: 'Add the missing icon to your AppIcon.appiconset',
            documentationUrl: 'https://developer.apple.com/design/human-interface-guidelines/app-icons'
          });
        }
      });
    }

    // Apply additional rules from database
    for (const rule of rules) {
      if (rule.checkType === 'file_exists') {
        const filePath = rule.path;
        if (!appDir.file(filePath)) {
          issues.push({
            id: `issue-${Date.now()}`,
            ruleId: rule.id,
            title: rule.title,
            description: rule.description,
            severity: rule.severity,
            fix: rule.fix,
            documentationUrl: rule.documentationUrl
          });
        }
      }
      // Add more rule types as needed
    }

    return issues;
  } catch (error) {
    console.error('Error scanning IPA:', error);
    return [{
      id: `issue-${Date.now()}`,
      ruleId: 'ios_scan_error',
      title: 'Scan Error',
      description: 'An error occurred while scanning the IPA file',
      severity: 'critical',
      fix: 'Try scanning a different IPA file or contact support',
      documentationUrl: 'https://support.submitguard.com'
    }];
  }
};
