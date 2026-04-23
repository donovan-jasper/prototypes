import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EmergencyButtonProps {
  onPress: () => void;
}

export function EmergencyButton({ onPress }: EmergencyButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Emergency button"
      accessibilityHint="Activates emergency mode"
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="alert" size={48} color="white" />
      </View>
      <Text style={styles.label}>EMERGENCY</Text>
      <Text style={styles.shakeText}>Shake phone to activate</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#ff0000',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  iconContainer: {
    marginBottom: 5,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  shakeText: {
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
  },
});
