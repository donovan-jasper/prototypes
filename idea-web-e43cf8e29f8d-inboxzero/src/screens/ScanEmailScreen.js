import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { addSubscription } from '../services/SubscriptionService';
import { scanEmailsForSubscriptions } from '../services/EmailScanService';

WebBrowser.maybeCompleteAuthSession();

const ScanEmailScreen = ({ navigation }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSubscriptions, setScannedSubscriptions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [provider, setProvider] = useState(null);

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'subsync',
    path: 'redirect'
  });

  const handleGmailConnect = async () => {
    setIsConnecting(true);
    setProvider('gmail');
    
    try {
      const clientId = 'YOUR_GOOGLE_CLIENT_ID';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=https://www.googleapis.com/auth/gmail.readonly`;
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      if (result.type === 'success') {
        const params = new URLSearchParams(result.url.split('#')[1]);
        const accessToken = params.get('access_token');
        
        if (accessToken) {
          await performScan(accessToken, 'gmail');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to Gmail');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOutlookConnect = async () => {
    setIsConnecting(true);
    setProvider('outlook');
    
    try {
      const clientId = 'YOUR_MICROSOFT_CLIENT_ID';
      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=https://graph.microsoft.com/Mail.Read`;
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      if (result.type === 'success') {
        const params = new URLSearchParams(result.url.split('#')[1]);
        const accessToken = params.get('access_token');
        
        if (accessToken) {
          await performScan(accessToken, 'outlook');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to Outlook');
    } finally {
      setIsConnecting(false);
    }
  };

  const performScan = async (accessToken, provider) => {
    setIsScanning(true);
    
    try {
      const subscriptions = await scanEmailsForSubscriptions(accessToken, provider);
      setScannedSubscriptions(subscriptions);
      
      if (subscriptions.length === 0) {
        Alert.alert('No Subscriptions Found', 'We couldn\'t find any subscription-related emails in your inbox.');
      }
    } catch (error) {
      Alert.alert('Scan Failed', 'Unable to scan your emails. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const toggleSelection = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) {
      Alert.alert('No Selection', 'Please select at least one subscription to import.');
      return;
    }

    const selectedSubs = scannedSubscriptions.filter(sub => selectedIds.has(sub.tempId));
    
    for (const sub of selectedSubs) {
      await addSubscription({
        name: sub.name,
        source: sub.source,
        category: 'email',
        cost: sub.cost || 0,
        unsubscribe_url: sub.unsubscribe_url,
        billing_cycle: sub.cost > 0 ? 'monthly' : null,
        renewal_date: null,
      });
    }

    Alert.alert(
      'Import Complete',
      `Successfully imported ${selectedIds.size} subscription${selectedIds.size > 1 ? 's' : ''}.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  if (isConnecting) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Connecting to {provider === 'gmail' ? 'Gmail' : 'Outlook'}...</Text>
      </View>
    );
  }

  if (isScanning) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Scanning your inbox...</Text>
        <Text style={styles.loadingSubtext}>This may take a moment</Text>
      </View>
    );
  }

  if (scannedSubscriptions.length > 0) {
    return (
      <View style={styles.container}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>Found {scannedSubscriptions.length} Subscriptions</Text>
          <Text style={styles.resultsSubtitle}>Select the ones you want to import</Text>
        </View>
        
        <ScrollView style={styles.resultsList}>
          {scannedSubscriptions.map((sub) => (
            <TouchableOpacity
              key={sub.tempId}
              style={[
                styles.resultItem,
                selectedIds.has(sub.tempId) && styles.resultItemSelected
              ]}
              onPress={() => toggleSelection(sub.tempId)}
            >
              <View style={styles.checkbox}>
                {selectedIds.has(sub.tempId) && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.resultName}>{sub.name}</Text>
                <Text style={styles.resultSource}>{sub.source}</Text>
                {sub.cost > 0 && (
                  <Text style={styles.resultCost}>${sub.cost.toFixed(2)}/mo</Text>
                )}
                {sub.unsubscribe_url && (
                  <Text style={styles.resultUrl} numberOfLines={1}>
                    {sub.unsubscribe_url}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.importFooter}>
          <TouchableOpacity
            style={[styles.importButton, selectedIds.size === 0 && styles.importButtonDisabled]}
            onPress={handleImport}
            disabled={selectedIds.size === 0}
          >
            <Text style={styles.importButtonText}>
              Import {selectedIds.size > 0 ? `${selectedIds.size} ` : ''}Selected
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Connect Your Email</Text>
        <Text style={styles.infoText}>
          We'll scan your inbox for subscription-related emails and help you import them automatically.
        </Text>
        <Text style={styles.infoSubtext}>
          We look for unsubscribe links, billing emails, and newsletter patterns.
        </Text>
      </View>

      <View style={styles.providerSection}>
        <TouchableOpacity style={styles.providerButton} onPress={handleGmailConnect}>
          <Text style={styles.providerIcon}>📧</Text>
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>Gmail</Text>
            <Text style={styles.providerDescription}>Connect your Google account</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.providerButton} onPress={handleOutlookConnect}>
          <Text style={styles.providerIcon}>📨</Text>
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>Outlook</Text>
            <Text style={styles.providerDescription}>Connect your Microsoft account</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.privacySection}>
        <Text style={styles.privacyText}>
          🔒 Your privacy matters. We only read email metadata and never store your credentials.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  infoSection: {
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
  },
  providerSection: {
    gap: 16,
    marginBottom: 32,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  providerIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  providerDescription: {
    fontSize: 14,
    color: '#666',
  },
  privacySection: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  resultsHeader: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resultSource: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  resultUrl: {
    fontSize: 12,
    color: '#999',
  },
  importFooter: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  importButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  importButtonDisabled: {
    backgroundColor: '#ccc',
  },
  importButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ScanEmailScreen;
