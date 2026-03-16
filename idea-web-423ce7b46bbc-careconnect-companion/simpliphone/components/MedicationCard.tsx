import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

export default function MedicationCard({ medication, onTakeNow }) {
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
        <View>
          <Text style={[styles.name, { color: theme.colors.text }]}>{medication.name}</Text>
          <Text style={[styles.dosage, { color: theme.colors.text }]}>{medication.dosage}</Text>
          <Text style={[styles.nextDose, { color: theme.colors.text }]}>Next dose: {medication.nextDose}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.takeNowButton, { backgroundColor: theme.colors.primary }]}
        onPress={onTakeNow}
        accessibilityRole="button"
        accessibilityLabel={`Take ${medication.name} now`}
      >
        <Text style={[styles.takeNowText, { color: theme.colors.onPrimary }]}>Take Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  medicationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  dosage: {
    fontSize: 16,
  },
  nextDose: {
    fontSize: 14,
    color: '#666',
  },
  takeNowButton: {
    padding: 10,
    borderRadius: 5,
  },
  takeNowText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
