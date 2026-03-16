import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useFileVault } from '@/hooks/useFileVault';
import { useSubscription } from '@/hooks/useSubscription';
import ExpirationPicker from '@/components/ExpirationPicker';
import PremiumGate from '@/components/PremiumGate';
import { Colors } from '@/constants/Colors';

export default function ShareScreen() {
  const [file, setFile] = useState(null);
  const [expiration, setExpiration] = useState(24);
  const { shareFile } = useFileVault();
  const { canShare, showPremiumGate } = useSubscription();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
    });

    if (result.type === 'success') {
      setFile(result);
    }
  };

  const handleShare = async () => {
    if (!canShare()) {
      showPremiumGate();
      return;
    }

    if (!file) {
      Alert.alert('No file selected', 'Please select a file to share');
      return;
    }

    try {
      const link = await shareFile(file, expiration);
      Alert.alert('Share link generated', link);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share a file</Text>
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={pickImage}
          style={styles.button}
          icon="camera"
        >
          Camera
        </Button>
        <Button
          mode="contained"
          onPress={pickDocument}
          style={styles.button}
          icon="file"
        >
          Documents
        </Button>
      </View>
      {file && (
        <>
          <Text style={styles.fileInfo}>
            Selected: {file.name || file.fileName || 'Unnamed file'}
          </Text>
          <ExpirationPicker
            value={expiration}
            onChange={setExpiration}
          />
          <Button
            mode="contained"
            onPress={handleShare}
            style={styles.shareButton}
            icon="share"
          >
            Generate Share Link
          </Button>
        </>
      )}
      <PremiumGate />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.light.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  fileInfo: {
    marginBottom: 20,
    color: Colors.light.text,
  },
  shareButton: {
    marginTop: 20,
  },
});
