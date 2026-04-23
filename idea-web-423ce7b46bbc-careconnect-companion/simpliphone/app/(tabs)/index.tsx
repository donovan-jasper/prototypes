import { View, StyleSheet, Linking, Alert } from 'react-native';
import { useContext, useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { SettingsContext } from '../../contexts/SettingsContext';
import BigButton from '../../components/BigButton';
import { detectShakeGesture } from '../../services/emergency';

export default function HomeScreen() {
  const { theme } = useContext(SettingsContext);
  const router = useRouter();

  useEffect(() => {
    const subscription = detectShakeGesture(() => {
      Alert.alert(
        'Emergency Mode',
        'Shake detected. Activate emergency mode?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Activate',
            onPress: () => router.push('/emergency'),
          },
        ]
      );
    });

    return () => {
      if (subscription && subscription.remove) {
        subscription.remove();
      }
    };
  }, []);

  const handleCall = () => {
    Linking.openURL('tel:');
  };

  const handleMessages = () => {
    router.push('/contacts');
  };

  const handlePhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status === 'granted') {
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
    }
  };

  const handleEmergency = () => {
    router.push('/emergency');
  };

  const handleMedications = () => {
    router.push('/medications');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.buttonRow}>
        <BigButton
          icon="phone"
          label="Call"
          onPress={handleCall}
        />
        <BigButton
          icon="message"
          label="Messages"
          onPress={handleMessages}
        />
      </View>
      <View style={styles.buttonRow}>
        <BigButton
          icon="photo"
          label="Photos"
          onPress={handlePhotos}
        />
        <BigButton
          icon="warning"
          label="Emergency"
          onPress={handleEmergency}
        />
      </View>
      <View style={styles.buttonRow}>
        <BigButton
          icon="medication"
          label="Medications"
          onPress={handleMedications}
        />
        <BigButton
          icon="settings"
          label="Settings"
          onPress={handleSettings}
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
