import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';

export default function BigButton({ icon, label, onPress }) {
  const { theme } = useContext(SettingsContext);

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.colors.primary }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <MaterialIcons name={icon} size={48} color={theme.colors.onPrimary} />
      <Text style={[styles.label, { color: theme.colors.onPrimary }]}>{label}</Text>
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
