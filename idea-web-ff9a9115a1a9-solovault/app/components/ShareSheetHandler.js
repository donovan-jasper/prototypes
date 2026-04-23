import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

const ShareSheetHandler = ({ navigation }) => {
  useEffect(() => {
    const handleSharedContent = async () => {
      const sharedContent = await Sharing.getInitialURLAsync();
      if (sharedContent) {
        // Process the shared content
        console.log('Received shared content:', sharedContent);

        // For text content
        if (sharedContent.startsWith('text:')) {
          const textContent = sharedContent.replace('text:', '');
          navigation.navigate('CaptureScreen', { sharedContent: textContent });
        }

        // For file content
        if (sharedContent.startsWith('file:')) {
          const fileUri = sharedContent.replace('file:', '');
          const fileInfo = await FileSystem.getInfoAsync(fileUri);
          console.log('Received file:', fileInfo);

          // You can process the file here (e.g., read it, display it, etc.)
          navigation.navigate('CaptureScreen', { sharedContent: fileUri });
        }
      }
    };

    handleSharedContent();
  }, [navigation]);

  return <View />;
};

export default ShareSheetHandler;
