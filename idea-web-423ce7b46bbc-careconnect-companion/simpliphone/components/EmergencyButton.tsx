import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

export default function EmergencyButton({ onPress }) {
  const { theme } = useContext(SettingsContext);

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.colors.error }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Emergency"
    >
      <MaterialIcons name="warning" size={48} color={theme.colors.onError} />
      <Text style={[styles.label, { color: theme.colors.onError }]}>Emergency</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 150,
    height: 150,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
