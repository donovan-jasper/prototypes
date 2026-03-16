import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuthStore } from '../lib/store/useAuthStore';

export default function PlatformSelector({ selectedPlatforms, onSelectPlatforms }) {
  const { isPremium } = useAuthStore();
  const platforms = ['TikTok Shop', 'Instagram Shopping', 'Facebook Marketplace'];

  const handleSelectPlatform = (platform) => {
    if (!isPremium && selectedPlatforms.length >= 2 && !selectedPlatforms.includes(platform)) {
      // Show upgrade modal
      return;
    }
    if (selectedPlatforms.includes(platform)) {
      onSelectPlatforms(selectedPlatforms.filter((p) => p !== platform));
    } else {
      onSelectPlatforms([...selectedPlatforms, platform]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Platforms</Text>
      {platforms.map((platform) => (
        <TouchableOpacity
          key={platform}
          style={[
            styles.platformItem,
            selectedPlatforms.includes(platform) && styles.selectedPlatformItem,
          ]}
          onPress={() => handleSelectPlatform(platform)}
          disabled={!isPremium && selectedPlatforms.length >= 2 && !selectedPlatforms.includes(platform)}
        >
          <Text style={styles.platformText}>{platform}</Text>
          {selectedPlatforms.includes(platform) ? (
            <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
          ) : (
            !isPremium && selectedPlatforms.length >= 2 && (
              <MaterialIcons name="lock" size={24} color="#666" />
            )
          )}
        </TouchableOpacity>
      ))}
      {!isPremium && selectedPlatforms.length >= 2 && (
        <Text style={styles.upgradeText}>Upgrade to Premium to connect more platforms</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  platformItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  selectedPlatformItem: {
    borderColor: '#4CAF50',
  },
  platformText: {
    fontSize: 16,
  },
  upgradeText: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
});
