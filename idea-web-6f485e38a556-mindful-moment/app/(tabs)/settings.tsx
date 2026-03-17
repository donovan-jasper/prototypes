import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput } from 'react-native';
import { useSettings } from '../../src/hooks';
import { useAppContext } from '../../src/context/AppContext';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const { settings, updateSettings, loading, error } = useSettings();
  const { isPremium } = useAppContext();
  const router = useRouter();

  const [quietHoursStart, setQuietHoursStart] = useState(settings?.quietHoursStart || 22);
  const [quietHoursEnd, setQuietHoursEnd] = useState(settings?.quietHoursEnd || 8);

  const handleSaveQuietHours = () => {
    updateSettings({
      quietHoursStart: parseInt(quietHoursStart.toString()),
      quietHoursEnd: parseInt(quietHoursEnd.toString())
    });
  };

  if (loading) return <Text>Loading settings...</Text>;
  if (error) return <Text>Error loading settings: {error.message}</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Notification Settings</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Quiet Hours</Text>
        <View style={styles.quietHoursContainer}>
          <TextInput
            style={styles.timeInput}
            value={quietHoursStart.toString()}
            onChangeText={setQuietHoursStart}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={styles.timeSeparator}>to</Text>
          <TextInput
            style={styles.timeInput}
            value={quietHoursEnd.toString()}
            onChangeText={setQuietHoursEnd}
            keyboardType="numeric"
            maxLength={2}
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveQuietHours}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Notification Style</Text>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Gentle</Text>
          <Switch
            value={settings?.notificationStyle === 'direct'}
            onValueChange={(value) => updateSettings({ notificationStyle: value ? 'direct' : 'gentle' })}
          />
          <Text style={styles.toggleLabel}>Direct</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Moment Preferences</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Preferred Categories</Text>
        <View style={styles.categoryContainer}>
          {['Calm', 'Focus', 'Energy', 'Perspective', 'Gratitude'].map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                settings?.preferredCategories.includes(category) && styles.categorySelected
              ]}
              onPress={() => {
                const updatedCategories = settings?.preferredCategories.includes(category)
                  ? settings.preferredCategories.filter(c => c !== category)
                  : [...settings.preferredCategories, category];
                updateSettings({ preferredCategories: updatedCategories });
              }}
            >
              <Text style={[
                styles.categoryText,
                settings?.preferredCategories.includes(category) && styles.categoryTextSelected
              ]}>{category}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Voice Options</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Preferred Voice</Text>
        <View style={styles.voiceContainer}>
          {['Calm Female', 'Warm Male', 'Neutral'].map((voice, index) => (
            <TouchableOpacity
              key={voice}
              style={[
                styles.voiceButton,
                settings?.preferredVoice === voice && styles.voiceSelected,
                (!isPremium && index > 0) && styles.lockedVoice
              ]}
              onPress={() => {
                if (isPremium || index === 0) {
                  updateSettings({ preferredVoice: voice });
                }
              }}
              disabled={!isPremium && index > 0}
            >
              <Text style={[
                styles.voiceText,
                settings?.preferredVoice === voice && styles.voiceTextSelected,
                (!isPremium && index > 0) && styles.lockedVoiceText
              ]}>
                {voice} {(!isPremium && index > 0) ? '🔒' : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Subscription</Text>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Premium Status</Text>
        <View style={styles.premiumContainer}>
          <Text style={styles.premiumStatus}>
            {isPremium ? 'Active Premium Member' : 'Free Tier'}
          </Text>
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={() => router.push('/premium')}
          >
            <Text style={styles.premiumButtonText}>
              {isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Custom Moments</Text>
        <TouchableOpacity
          style={styles.createMomentButton}
          onPress={() => router.push('/moment/create')}
        >
          <Text style={styles.createMomentButtonText}>Create Your Own Moment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quietHoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    width: 50,
    textAlign: 'center',
    marginRight: 8,
  },
  timeSeparator: {
    marginHorizontal: 8,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '60%',
  },
  toggleLabel: {
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  categorySelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  categoryText: {
    color: '#666',
  },
  categoryTextSelected: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  voiceContainer: {
    marginTop: 8,
  },
  voiceButton: {
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  voiceSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1976d2',
  },
  lockedVoice: {
    opacity: 0.7,
  },
  voiceText: {
    color: '#666',
  },
  voiceTextSelected: {
    color: '#1976d2',
    fontWeight: 'bold',
  },
  lockedVoiceText: {
    color: '#999',
  },
  premiumContainer: {
    marginTop: 8,
  },
  premiumStatus: {
    fontSize: 16,
    marginBottom: 8,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  premiumButton: {
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  createMomentButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  createMomentButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
