import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onChange: (platforms: string[]) => void;
  isPremium: boolean;
}

const platforms = [
  {
    name: 'TikTok Shop',
    icon: 'tiktok',
    color: '#000000',
  },
  {
    name: 'Instagram Shopping',
    icon: 'instagram',
    color: '#E1306C',
  },
  {
    name: 'Facebook Marketplace',
    icon: 'facebook',
    color: '#4267B2',
  },
];

export default function PlatformSelector({
  selectedPlatforms,
  onChange,
  isPremium,
}: PlatformSelectorProps) {
  const navigation = useNavigation();

  const togglePlatform = (platformName: string) => {
    if (!isPremium && selectedPlatforms.length >= 2 && !selectedPlatforms.includes(platformName)) {
      // Show upgrade modal (handled in parent component)
      return;
    }

    if (selectedPlatforms.includes(platformName)) {
      onChange(selectedPlatforms.filter(p => p !== platformName));
    } else {
      onChange([...selectedPlatforms, platformName]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Post to platforms:</Text>
      <View style={styles.platformsContainer}>
        {platforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.name);
          const isDisabled = !isPremium && selectedPlatforms.length >= 2 && !isSelected;

          return (
            <TouchableOpacity
              key={platform.name}
              style={[
                styles.platformButton,
                isSelected && styles.selectedPlatform,
                isDisabled && styles.disabledPlatform,
              ]}
              onPress={() => togglePlatform(platform.name)}
              disabled={isDisabled}
            >
              <MaterialCommunityIcons
                name={platform.icon}
                size={24}
                color={isSelected ? 'white' : platform.color}
              />
              <Text
                style={[
                  styles.platformText,
                  isSelected && styles.selectedText,
                  isDisabled && styles.disabledText,
                ]}
              >
                {platform.name}
              </Text>
              {isDisabled && (
                <MaterialCommunityIcons
                  name="lock"
                  size={16}
                  color="white"
                  style={styles.lockIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      {!isPremium && (
        <TouchableOpacity
          style={styles.upgradeContainer}
          onPress={() => navigation.navigate('settings')}
        >
          <Text style={styles.upgradeText}>
            Upgrade to Premium to post to all platforms
          </Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color="#666"
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  platformButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
    width: '48%',
  },
  selectedPlatform: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  disabledPlatform: {
    backgroundColor: '#9E9E9E',
    borderColor: '#9E9E9E',
    opacity: 0.7,
  },
  platformText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  selectedText: {
    color: 'white',
    fontWeight: '500',
  },
  disabledText: {
    color: 'white',
  },
  lockIcon: {
    marginLeft: 'auto',
  },
  upgradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  upgradeText: {
    color: '#666',
    fontSize: 14,
    marginRight: 4,
  },
});
