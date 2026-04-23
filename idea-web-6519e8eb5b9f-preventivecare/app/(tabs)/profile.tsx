import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useAppStore } from '../../store/appStore';
import PreventiveCareCard from '../../components/PreventiveCareCard';
import { scheduleAllPreventiveCareReminders } from '../../lib/notifications';
import { PREVENTIVE_CARE_RECOMMENDATIONS } from '../../constants/PreventiveCare';

const ProfileScreen = () => {
  const user = useAppStore(state => state.user);
  const [recommendedScreenings, setRecommendedScreenings] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const recommendations = PREVENTIVE_CARE_RECOMMENDATIONS.find(
        rec => user.age >= rec.ageRange[0] && user.age <= rec.ageRange[1] && rec.gender === user.gender
      );

      if (recommendations) {
        setRecommendedScreenings(recommendations.screenings);
      }

      // Schedule all preventive care reminders
      scheduleAllPreventiveCareReminders(user.id).catch(error => {
        console.error('Error scheduling preventive care reminders:', error);
        Alert.alert('Error', 'Failed to schedule preventive care reminders');
      });
    }
  }, [user]);

  const calculateNextDueDate = (frequency: string) => {
    const today = new Date();
    const nextDate = new Date(today);

    if (frequency === 'annual') {
      nextDate.setFullYear(today.getFullYear() + 1);
    } else if (frequency === 'biennial') {
      nextDate.setFullYear(today.getFullYear() + 2);
    }

    return nextDate;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended Screenings</Text>
        {recommendedScreenings.length > 0 ? (
          recommendedScreenings.map((screening, index) => (
            <PreventiveCareCard
              key={index}
              screening={screening}
              nextDueDate={calculateNextDueDate(screening.frequency)}
            />
          ))
        ) : (
          <Text style={styles.emptyState}>
            No recommended screenings found for your age and gender.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  emptyState: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ProfileScreen;
