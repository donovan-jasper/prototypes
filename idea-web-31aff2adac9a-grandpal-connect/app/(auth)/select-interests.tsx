import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Chip, Button, ActivityIndicator } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INTERESTS } from '@/constants/interests';
import { getUserById } from '@/lib/database';
import * as SQLite from 'expo-sqlite';

export default function SelectInterestsScreen() {
  const params = useLocalSearchParams();
  const isEditing = params.edit === 'true';
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      loadCurrentInterests();
    }
  }, [isEditing]);

  const loadCurrentInterests = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const user = await getUserById(userId);
      if (user && user.interests) {
        setSelectedInterests(user.interests);
      }
    } catch (err) {
      console.error('Failed to load interests:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedInterests.length === 0) {
      return;
    }

    setLoading(true);

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not logged in');
      }

      const db = await SQLite.openDatabaseAsync('bridgecircle.db');
      await db.runAsync(
        'UPDATE users SET interests = ? WHERE id = ?',
        [JSON.stringify(selectedInterests), userId]
      );

      if (isEditing) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Failed to save interests:', err);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            {isEditing ? 'Edit Your Interests' : 'Select Your Interests'}
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Choose topics you're passionate about or want to learn
          </Text>
          <Text variant="bodyMedium" style={styles.count}>
            {selectedInterests.length} selected
          </Text>
        </View>

        <View style={styles.chipsContainer}>
          {INTERESTS.map((interest) => (
            <Chip
              key={interest}
              selected={selectedInterests.includes(interest)}
              onPress={() => toggleInterest(interest)}
              style={[
                styles.chip,
                selectedInterests.includes(interest) && styles.chipSelected
              ]}
              mode={selectedInterests.includes(interest) ? 'flat' : 'outlined'}
            >
              {interest}
            </Chip>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleContinue}
          loading={loading}
          disabled={loading || selectedInterests.length === 0}
          style={styles.button}
        >
          {isEditing ? 'Save Changes' : 'Continue'}
        </Button>
        {isEditing && (
          <Button
            mode="text"
            onPress={() => router.back()}
            disabled={loading}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
    marginBottom: 16,
  },
  count: {
    color: '#6200ee',
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  chipSelected: {
    backgroundColor: '#6200ee',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    paddingVertical: 6,
  },
  cancelButton: {
    marginTop: 8,
  },
});
