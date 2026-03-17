import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

export default function MedicationCard({ medication, onTakeNow, onSkip, onSnooze }) {
  const { theme } = useContext(SettingsContext);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.medicationInfo}>
        {medication.photo ? (
          <Image source={{ uri: medication.photo }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, { backgroundColor: theme.colors.primary }]}>
            <MaterialIcons name="medication" size={24} color={theme.colors.onPrimary} />
          </View>
        )}
        <View style={styles.details}>
          <Text style={[styles.name, { color: theme.colors.text }]}>{medication.name}</Text>
          <Text style={[styles.dosage, { color: theme.colors.text }]}>{medication.dosage}</Text>
          <Text style={[styles.nextDose, { color: theme.colors.text }]}>Next dose: {medication.nextDose}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={onTakeNow}
          accessibilityRole="button"
          accessibilityLabel={`Take ${medication.name} now`}
        >
          <Text style={[styles.actionText, { color: theme.colors.onPrimary }]}>Take Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#666' }]}
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel={`Skip ${medication.name}`}
        >
          <Text style={[styles.actionText, { color: '#fff' }]}>Skipped</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
          onPress={onSnooze}
          accessibilityRole="button"
          accessibilityLabel={`Snooze ${medication.name} for 15 minutes`}
        >
          <Text style={[styles.actionText, { color: '#fff' }]}>Snooze 15min</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  photo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dosage: {
    fontSize: 16,
    marginTop: 2,
  },
  nextDose: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});
