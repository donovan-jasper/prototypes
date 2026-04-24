import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';
import { parseString } from 'xml2js';
import { ComplianceIssue } from '../types';
import { getRules } from '../database';

export const scanAPK = async (fileUri: string): Promise<ComplianceIssue[]> => {
  try {
    // Read the APK file
    const fileContent = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Load the APK as a ZIP file
    const zip = await JSZip.loadAsync(fileContent, { base64: true });
    const issues: ComplianceIssue[] = [];

    // Get Android compliance rules
    const rules = await getRules('android');

    // Check for AndroidManifest.xml
    const manifestFile = zip.file('AndroidManifest.xml');
    if (!manifestFile) {
      issues.push({
        id: `issue-${Date.now()}`,
        ruleId: 'android_missing_manifest',
        title: 'Missing AndroidManifest.xml',
        description: 'The APK file is missing the required AndroidManifest.xml file',
        severity: 'critical',
        fix: 'Ensure your Android project has a properly configured AndroidManifest.xml file',
        documentationUrl: 'https://developer.android.com/guide/topics/manifest/manifest-intro'
      });
      return issues;
    }

    // Parse AndroidManifest.xml
    const manifestContent = await manifestFile.async('text');
    let manifestJson: any;

    await new Promise<void>((resolve, reject) => {
      parseString(manifestContent, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        manifestJson = result;
        resolve();
      });
    });

    // Check required attributes
    const manifest = manifestJson.manifest;
    if (!manifest.$.package) {
      issues.push({
        id: `issue-${Date.now()}`,
        ruleId: 'android_missing_package',
        title: 'Missing Package Name',
        description: 'The AndroidManifest.xml is missing the required package attribute',
        severity: 'critical',
        fix: 'Add the package attribute to your AndroidManifest.xml',
        documentationUrl: 'https://developer.android.com/guide/topics/manifest/manifest-element'
      });
    }

    if (!manifest.$['android:versionCode']) {
      issues.push({
        id: `issue-${Date.now()}`,
        ruleId: 'android_missing_version_code',
        title: 'Missing Version Code',
        description: 'The AndroidManifest.xml is missing the required android:versionCode attribute',
        severity: 'critical',
        fix: 'Add the android:versionCode attribute to your AndroidManifest.xml',
        documentationUrl: 'https://developer.android.com/guide/topics/manifest/manifest-element'
      });
    }

    if (!manifest.$['android:versionName']) {
      issues.push({
        id: `issue-${Date.now()}`,
        ruleId: 'android_missing_version_name',
        title: 'Missing Version Name',
        description: 'The AndroidManifest.xml is missing the required android:versionName attribute',
        severity: 'critical',
        fix: 'Add the android:versionName attribute to your AndroidManifest.xml',
        documentationUrl: 'https://developer.android.com/guide/topics/manifest/manifest-element'
      });
    }

    // Check application name
    if (manifest.application && manifest.application[0].$['android:label']) {
      const label = manifest.application[0].$['android:label'];
      if (label.startsWith('@string/')) {
        // Check if the string resource exists
        const resDir = zip.folder('res');
        if (resDir) {
          const stringFileName = label.replace('@string/', '') + '.xml';
          const stringFiles = resDir.folder('values')?.file(stringFileName);

          if (!stringFiles) {
            issues.push({
              id: `issue-${Date.now()}`,
              ruleId: 'android_missing_string_resource',
              title: 'Missing String Resource',
              description: `The string resource ${label} is referenced but not found`,
              severity: 'warning',
              fix: 'Add the missing string resource to your strings.xml file',
              documentationUrl: 'https://developer.android.com/guide/topics/resources/string-resource'
            });
          }
        }
      }
    }

    // Check icon files
    const iconFiles = [
      'res/mipmap-mdpi/ic_launcher.png',
      'res/mipmap-hdpi/ic_launcher.png',
      'res/mipmap-xhdpi/ic_launcher.png',
      'res/mipmap-xxhdpi/ic_launcher.png',
      'res/mipmap-xxxhdpi/ic_launcher.png'
    ];

    iconFiles.forEach(icon => {
      if (!zip.file(icon)) {
        issues.push({
          id: `issue-${Date.now()}`,
          ruleId: `android_missing_icon_${icon.split('/').pop()}`,
          title: `Missing Icon: ${icon.split('/').pop()}`,
          description: `The APK is missing the required icon file: ${icon}`,
          severity: 'warning',
          fix: 'Add the missing icon to your mipmap resources',
          documentationUrl: 'https://developer.android.com/guide/practices/ui_guidelines/icon_design_launcher'
        });
      }
    });

    // Check for required permissions
    const requiredPermissions = [
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE'
    ];

    if (manifest['uses-permission']) {
      const declaredPermissions = manifest['uses-permission'].map((p: any) => p.$['android:name']);
      requiredPermissions.forEach(perm => {
        if (!declaredPermissions.includes(perm)) {
          issues.push({
            id: `issue-${Date.now()}`,
            ruleId: `android_missing_permission_${perm.split('.').pop()}`,
            title: `Missing Permission: ${perm}`,
            description: `The APK is missing the required permission: ${perm}`,
            severity: 'warning',
            fix: `Add the permission to your AndroidManifest.xml: <uses-permission android:name="${perm}" />`,
            documentationUrl: 'https://developer.android.com/guide/topics/manifest/uses-permission-element'
          });
        }
      });
    } else {
      issues.push({
        id: `issue-${Date.now()}`,
        ruleId: 'android_missing_permissions',
        title: 'Missing Permissions',
        description: 'The AndroidManifest.xml is missing required permissions',
        severity: 'warning',
        fix: 'Add the required permissions to your AndroidManifest.xml',
        documentationUrl: 'https://developer.android.com/guide/topics/manifest/uses-permission-element'
      });
    }

    // Check target SDK version
    if (manifest.$['android:targetSdkVersion']) {
      const targetSdk = parseInt(manifest.$['android:targetSdkVersion']);
      if (targetSdk < 31) {
        issues.push({
          id: `issue-${Date.now()}`,
          ruleId: 'android_outdated_sdk',
          title: 'Outdated Target SDK Version',
          description: `The target SDK version (${targetSdk}) is below the recommended minimum of 31`,
          severity: 'warning',
          fix: 'Update the targetSdkVersion to at least 31 in your build.gradle file',
          documentationUrl: 'https://developer.android.com/about/versions/12'
        });
      }
    } else {
      issues.push({
        id: `issue-${Date.now()}`,
        ruleId: 'android_missing_sdk_version',
        title: 'Missing Target SDK Version',
        description: 'The AndroidManifest.xml is missing the required android:targetSdkVersion attribute',
        severity: 'critical',
        fix: 'Add the android:targetSdkVersion attribute to your AndroidManifest.xml',
        documentationUrl: 'https://developer.android.com/guide/topics/manifest/uses-sdk-element'
      });
    }

    return issues;
  } catch (error) {
    console.error('Error scanning APK:', error);
    return [{
      id: `issue-${Date.now()}`,
      ruleId: 'android_scan_error',
      title: 'APK Scan Error',
      description: 'An unexpected error occurred while scanning the APK file',
      severity: 'critical',
      fix: 'Try scanning a different APK file or contact support',
      documentationUrl: 'https://developer.android.com/studio/publish/preparing'
    }];
  }
};
