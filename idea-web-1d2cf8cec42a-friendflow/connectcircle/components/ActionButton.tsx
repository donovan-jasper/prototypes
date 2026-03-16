import { TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

export default function ActionButton({ icon, label, onPress }: ActionButtonProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <MaterialIcons name={icon} size={24} color={theme.colors.primary} />
      <Text variant="bodyMedium" style={styles.label}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
  },
  label: {
    marginTop: 4,
  },
});
