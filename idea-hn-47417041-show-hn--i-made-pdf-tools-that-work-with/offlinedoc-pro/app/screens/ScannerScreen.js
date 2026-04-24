import React, { useState, useRef } from 'react';
import { View, StyleSheet, Button, Alert, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { convertImageToPDF } from '../utils/pdfProcessor';

const ScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const cameraRef = useRef(null);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && !isProcessing) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
          exif: false,
        });

        // Process the image to improve quality before conversion
        const manipResult = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 1200 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );

        const pdfData = await convertImageToPDF(manipResult.uri);
        navigation.navigate('Editor', { pdfData });
      } catch (error) {
        Alert.alert('Error', 'Failed to process document');
        console.error('Processing error:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={type}
        ref={cameraRef}
        ratio="16:9"
      >
        <View style={styles.buttonContainer}>
          <Button
            title="Flip Camera"
            onPress={() => {
              setType(
                type === Camera.Constants.Type.back
                  ? Camera.Constants.Type.front
                  : Camera.Constants.Type.back
              );
            }}
          />
        </View>
      </Camera>

      <View style={styles.captureButtonContainer}>
        {isProcessing ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Button
            title="Capture Document"
            onPress={takePicture}
            disabled={isProcessing}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  captureButtonContainer: {
    padding: 20,
    backgroundColor: 'white',
  },
});

export default ScannerScreen;
