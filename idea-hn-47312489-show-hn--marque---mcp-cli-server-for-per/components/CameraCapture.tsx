import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const CameraCapture = ({ onCapture }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [image, setImage] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setImage(photo.uri);
      onCapture(photo.uri);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      onCapture(result.assets[0].uri);
    }
  };

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {image ? (
        <View className="flex-1">
          <Image source={{ uri: image }} className="flex-1" />
          <TouchableOpacity
            onPress={() => setImage(null)}
            className="absolute bottom-4 right-4 bg-white p-2 rounded-full"
          >
            <Ionicons name="camera" size={24} color="black" />
          </TouchableOpacity>
        </View>
      ) : (
        <Camera
          ref={cameraRef}
          type={type}
          className="flex-1"
          ratio="16:9"
        >
          <View className="flex-1 bg-transparent flex-row">
            <TouchableOpacity
              onPress={() => {
                setType(
                  type === Camera.Constants.Type.back
                    ? Camera.Constants.Type.front
                    : Camera.Constants.Type.back
                );
              }}
              className="absolute bottom-4 left-4 bg-white p-2 rounded-full"
            >
              <Ionicons name="camera-reverse" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={takePicture}
              className="absolute bottom-4 self-center bg-white p-4 rounded-full"
            >
              <Ionicons name="camera" size={32} color="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickImage}
              className="absolute bottom-4 right-4 bg-white p-2 rounded-full"
            >
              <Ionicons name="image" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </Camera>
      )}
    </View>
  );
};

export default CameraCapture;
