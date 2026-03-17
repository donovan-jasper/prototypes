import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useMoments, useStreak, useSettings } from '../../src/hooks';
import { MomentCard, StreakDisplay, NotificationPrompt } from '../../src/components';
import { useAppContext } from '../../src/context/AppContext';

export default function HomeScreen() {
  const router = useRouter();
  const { moments, loading, error } = useMoments();
  const { streak } = useStreak();
  const { settings } = useSettings();
  const { hasNotificationPermission, requestNotificationPermission, isPremium } = useAppContext();
  const [todayMoments, setTodayMoments] = useState([]);

  useEffect(() => {
    if (moments && moments.length > 0) {
      // Filter moments for today based on user preferences
      const filtered = moments.filter(moment =>
        settings.preferredCategories.includes(moment.category) &&
        (!moment.isPremium || isPremium)
      );
      setTodayMoments(filtered.slice(0, isPremium ? 10 : 3));
    }
  }, [moments, settings, isPremium]);

  if (loading) return <Text>Loading your moments...</Text>;
  if (error) return <Text>Error loading moments: {error.message}</Text>;

  return (
    <ScrollView style={styles.container}>
      {!hasNotificationPermission && (
        <NotificationPrompt onRequestPermission={requestNotificationPermission} />
      )}

      <StreakDisplay streak={streak} />

      <Text style={styles.sectionTitle}>Your Moments Today</Text>

      {todayMoments.length > 0 ? (
        todayMoments.map((moment) => (
          <MomentCard
            key={moment.id}
            moment={moment}
            onPress={() => router.push(`/moment/${moment.id}`)}
          />
        ))
      ) : (
        <Text style={styles.emptyState}>No moments available for today. Check back later!</Text>
      )}

      <TouchableOpacity
        style={styles.takeNowButton}
        onPress={() => router.push('/moment/random')}
      >
        <Text style={styles.takeNowText}>Take a Moment Now</Text>
      </TouchableOpacity>

      {!isPremium && (
        <View style={styles.premiumPrompt}>
          <Text style={styles.premiumText}>Unlock more moments with Premium</Text>
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={() => router.push('/premium')}
          >
            <Text style={styles.premiumButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginVertical: 16,
  },
  emptyState: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 20,
  },
  takeNowButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  takeNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  premiumPrompt: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 16,
    color: '#1976d2',
    marginBottom: 12,
    fontWeight: 'bold',
  },
  premiumButton: {
    backgroundColor: '#1976d2',
    padding: 12,
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
  },
  premiumButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
