import { View, StyleSheet } from 'react-native';
import { useContext } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';
import BigButton from '../../components/BigButton';

export default function HomeScreen() {
  const { theme } = useContext(SettingsContext);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.buttonRow}>
        <BigButton
          icon="phone"
          label="Call"
          onPress={() => console.log('Call pressed')}
        />
        <BigButton
          icon="message"
          label="Messages"
          onPress={() => console.log('Messages pressed')}
        />
      </View>
      <View style={styles.buttonRow}>
        <BigButton
          icon="photo"
          label="Photos"
          onPress={() => console.log('Photos pressed')}
        />
        <BigButton
          icon="warning"
          label="Emergency"
          onPress={() => console.log('Emergency pressed')}
        />
      </View>
      <View style={styles.buttonRow}>
        <BigButton
          icon="medication"
          label="Medications"
          onPress={() => console.log('Medications pressed')}
        />
        <BigButton
          icon="settings"
          label="Settings"
          onPress={() => console.log('Settings pressed')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
});
