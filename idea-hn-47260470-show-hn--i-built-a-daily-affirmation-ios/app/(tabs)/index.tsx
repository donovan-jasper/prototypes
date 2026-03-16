import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useStore } from '../../store/useStore';
import AffirmationCard from '../../components/AffirmationCard';
import NotificationPermission from '../../components/NotificationPermission';
import { getAffirmationForContext } from '../../lib/affirmations';
import { logSession } from '../../lib/database';

const HomeScreen = () => {
  const currentAffirmation = useStore((state) => state.currentAffirmation);
  const streakCount = useStore((state) => state.streakCount);
  const lastMoodRating = useStore((state) => state.lastMoodRating);
  const setAffirmation = useStore((state) => state.setAffirmation);

  useEffect(() => {
    const fetchAffirmation = async () => {
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      const affirmation = await getAffirmationForContext(timeOfDay, lastMoodRating, streakCount);
      setAffirmation(affirmation);
      if (affirmation?.id) {
        await logSession(affirmation.id, lastMoodRating);
      }
    };

    fetchAffirmation();
  }, [lastMoodRating, streakCount, setAffirmation]);

  return (
    <View style={styles.container}>
      <NotificationPermission />
      {currentAffirmation && <AffirmationCard affirmation={currentAffirmation} streakCount={streakCount} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default HomeScreen;
