import { View, StyleSheet, ScrollView } from 'react-native';
import { BigButton } from '../../components/BigButton';
import { EmergencyButton } from '../../components/EmergencyButton';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const handleEmergencyPress = () => {
    router.push('/emergency');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.row}>
        <BigButton
          icon="phone"
          label="Call"
          onPress={() => router.push('/(tabs)/contacts')}
        />
        <BigButton
          icon="message"
          label="Messages"
          onPress={() => router.push('/(tabs)/contacts')}
        />
      </View>
      <View style={styles.row}>
        <BigButton
          icon="photo"
          label="Photos"
          onPress={() => {}}
        />
        <EmergencyButton onPress={handleEmergencyPress} />
      </View>
      <View style={styles.row}>
        <BigButton
          icon="pill"
          label="Medications"
          onPress={() => router.push('/(tabs)/medications')}
        />
        <BigButton
          icon="settings"
          label="Settings"
          onPress={() => router.push('/(tabs)/settings')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
});
