import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Library from '../components/Library';
import { 
  getInProgressContent, 
  getAutoDownloadSettings, 
  setAutoDownloadEnabled,
  getAutoDownloadedContent,
  clearAutoDownloadNotifications
} from '../utils/offlineLibrary';

interface InProgressItem {
  id: number;
  title: string;
  percentage_complete: number;
  last_updated: number;
}

interface AutoDownloadedItem {
  id: number;
  title: string;
  downloaded_at: number;
}

const HomeScreen = () => {
  const [inProgressContent, setInProgressContent] = useState<InProgressItem[]>([]);
  const [autoDownloadEnabled, setAutoDownloadEnabledState] = useState(false);
  const [autoDownloadedItems, setAutoDownloadedItems] = useState<AutoDownloadedItem[]>([]);
  const navigation = useNavigation<any>();

  const loadData = useCallback(async () => {
    const inProgress = await getInProgressContent();
    setInProgressContent(inProgress as InProgressItem[]);

    const settings = await getAutoDownloadSettings();
    setAutoDownloadEnabledState(settings.auto_download_enabled === 1);

    const autoDownloaded = await getAutoDownloadedContent();
    setAutoDownloadedItems(autoDownloaded as AutoDownloadedItem[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleToggleAutoDownload = async (value: boolean) => {
    setAutoDownloadEnabledState(value);
    await setAutoDownloadEnabled(value);
    if (value) {
      Alert.alert(
        'Auto-Download Enabled',
        'The next 3 chapters will be automatically downloaded when you finish reading a chapter (90%+ complete).'
      );
    }
  };

  const handleContinueReading = (id: number) => {
    navigation.navigate('Reader', { contentId: id });
  };

  const handleClearNotifications = async () => {
    await clearAutoDownloadNotifications();
    setAutoDownloadedItems([]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PageTurner Pro</Text>
      </View>

      <View style={styles.settingsSection}>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Auto-Download Next Chapters</Text>
            <Text style={styles.settingDescription}>
              Automatically download the next 3 chapters when you finish reading
            </Text>
          </View>
          <Switch
            value={autoDownloadEnabled}
            onValueChange={handleToggleAutoDownload}
            trackColor={{ false: '#d0d0d0', true: '#007AFF' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {autoDownloadedItems.length > 0 && (
        <View style={styles.notificationSection}>
          <View style={styles.notificationHeader}>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{autoDownloadedItems.length}</Text>
            </View>
            <Text style={styles.notificationTitle}>New Content Auto-Downloaded</Text>
            <TouchableOpacity onPress={handleClearNotifications}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>
          {autoDownloadedItems.map((item) => (
            <View key={item.id} style={styles.notificationItem}>
              <Text style={styles.notificationItemTitle}>{item.title}</Text>
              <Text style={styles.notificationItemTime}>
                {new Date(item.downloaded_at).toLocaleTimeString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {inProgressContent.length > 0 && (
        <View style={styles.continueSection}>
          <Text style={styles.sectionTitle}>Continue Reading</Text>
          {inProgressContent.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.continueCard}
              onPress={() => handleContinueReading(item.id)}
            >
              <View style={styles.continueCardContent}>
                <Text style={styles.continueCardTitle}>{item.title}</Text>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[styles.progressBarFill, { width: `${item.percentage_complete}%` }]} 
                    />
                  </View>
                  <Text style={styles.progressText}>{Math.round(item.percentage_complete)}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.librarySection}>
        <Text style={styles.sectionTitle}>My Library</Text>
        <Library />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  settingsSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  notificationSection: {
    backgroundColor: '#fff',
    marginTop: 12,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  notificationBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  notificationItem: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  notificationItemTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  notificationItemTime: {
    fontSize: 12,
    color: '#999',
  },
  continueSection: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  continueCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueCardContent: {
    flex: 1,
  },
  continueCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 45,
    textAlign: 'right',
  },
  librarySection: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
});

export default HomeScreen;
