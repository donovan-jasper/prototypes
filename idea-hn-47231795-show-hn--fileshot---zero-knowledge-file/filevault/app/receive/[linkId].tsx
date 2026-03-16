import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useFileVault } from '@/hooks/useFileVault';
import { Colors } from '@/constants/Colors';

export default function ReceiveScreen() {
  const { linkId } = useLocalSearchParams();
  const [fileInfo, setFileInfo] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const { receiveFile, validateLink } = useFileVault();

  useEffect(() => {
    const checkLink = async () => {
      try {
        const info = await validateLink(linkId);
        setFileInfo(info);
        setIsExpired(false);
      } catch (error) {
        setIsExpired(true);
        Alert.alert('Link Expired', error.message);
      }
    };

    checkLink();
  }, [linkId]);

  const handleDownload = async () => {
    try {
      await receiveFile(linkId);
      Alert.alert('Success', 'File downloaded successfully');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  if (isExpired) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Link Expired</Text>
        <Text>This share link has expired and is no longer available.</Text>
      </View>
    );
  }

  if (!fileInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receive File</Text>
      <Text>File: {fileInfo.name}</Text>
      <Text>Size: {fileInfo.size} bytes</Text>
      <Text>Expires in: {fileInfo.expiresIn} hours</Text>
      <Button
        mode="contained"
        onPress={handleDownload}
        style={styles.button}
        icon="download"
      >
        Download File
      </Button>
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
  button: {
    marginTop: 20,
  },
});
