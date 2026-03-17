import { View, StyleSheet, FlatList, Text } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';
import MedicationCard from '../../components/MedicationCard';
import { useMedications } from '../../hooks/useMedications';
import { getAdherenceReport } from '../../database/medications';

export default function MedicationsScreen() {
  const { theme } = useContext(SettingsContext);
  const { medications, loadMedications, handleTaken, handleSkipped, handleSnoozed } = useMedications();
  const [adherenceStatus, setAdherenceStatus] = useState({});

  useEffect(() => {
    loadMedications();
  }, []);

  useEffect(() => {
    const loadAdherenceStatus = async () => {
      const status = {};
      const today = new Date().toISOString().split('T')[0];
      
      for (const med of medications) {
        const report = await getAdherenceReport(med.id, today, today);
        if (report.length > 0) {
          const lastEntry = report[report.length - 1];
          const timestamp = new Date(lastEntry.timestamp);
          const now = new Date();
          const hoursAgo = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
          
          if (lastEntry.status === 'taken') {
            status[med.id] = `Last taken: ${hoursAgo} hours ago`;
          } else if (lastEntry.status === 'skipped') {
            status[med.id] = 'Skipped today';
          } else if (lastEntry.status === 'snoozed') {
            status[med.id] = 'Snoozed';
          }
        } else {
          status[med.id] = 'Not taken today';
        }
      }
      
      setAdherenceStatus(status);
    };

    if (medications.length > 0) {
      loadAdherenceStatus();
    }
  }, [medications]);

  const getNextDoseTime = (schedule) => {
    const times = schedule.split(',').map(t => t.trim());
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const time of times) {
      const [hour, minute] = time.split(':').map(num => parseInt(num));
      const timeMinutes = hour * 60 + minute;
      
      if (timeMinutes > currentMinutes) {
        return `Today at ${time}`;
      }
    }

    return `Tomorrow at ${times[0]}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <MedicationCard
              medication={{
                ...item,
                nextDose: getNextDoseTime(item.schedule),
              }}
              onTakeNow={() => handleTaken(item.id)}
              onSkip={() => handleSkipped(item.id)}
              onSnooze={() => handleSnoozed(item.id)}
            />
            {adherenceStatus[item.id] && (
              <Text style={[styles.adherenceStatus, { color: theme.colors.text }]}>
                {adherenceStatus[item.id]}
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  adherenceStatus: {
    fontSize: 14,
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 15,
    fontStyle: 'italic',
  },
});
