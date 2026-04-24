import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer, TextureLoader, Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, Mesh, OBJLoader } from 'expo-three';
import * as THREE from 'three';
import { Asset } from 'expo-asset';
import { Camera } from 'expo-camera';
import { AR } from 'expo';

const ARTryOnScreen = ({ route }) => {
  const { outfit } = route.params || {};
  const [renderer, setRenderer] = useState(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [hasPermission, setHasPermission] = useState(null);
  const [isARReady, setIsARReady] = useState(false);
  const glViewRef = useRef(null);
  const arSession = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (renderer && scene && camera && outfit && hasPermission) {
      setupARScene();
    }
  }, [renderer, scene, camera, outfit, hasPermission]);

  const loadModel = async (modelPath) => {
    try {
      const asset = Asset.fromModule(modelPath);
      await asset.downloadAsync();
      const loader = new OBJLoader();
      const model = await loader.loadAsync(asset.localUri);
      return model;
    } catch (error) {
      console.error('Error loading model:', error);
      return null;
    }
  };

  const setupARScene = async () => {
    try {
      // Clear previous models
      scene.children.forEach(child => {
        if (child instanceof Mesh) {
          scene.remove(child);
        }
      });

      // Initialize AR session
      if (Platform.OS === 'ios') {
        arSession.current = await AR.startAsync();
        await AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);
      }

      // Create avatar (simplified as a box)
      const avatarGeometry = new BoxGeometry(0.5, 1.5, 0.3);
      const avatarMaterial = new MeshBasicMaterial({ color: 0x8B4513 }); // Brown color
      const avatar = new Mesh(avatarGeometry, avatarMaterial);
      avatar.position.set(0, -0.75, -1.5);
      scene.add(avatar);

      // Load and position clothing items
      if (outfit.top) {
        const shirtModel = await loadModel(require('../../assets/models/shirt.obj'));
        if (shirtModel) {
          shirtModel.position.set(0, 0.2, -1.5);
          shirtModel.scale.set(0.3, 0.3, 0.3);
          scene.add(shirtModel);
        }
      }

      if (outfit.bottom) {
        const pantsModel = await loadModel(require('../../assets/models/pants.obj'));
        if (pantsModel) {
          pantsModel.position.set(0, -0.5, -1.5);
          pantsModel.scale.set(0.3, 0.3, 0.3);
          scene.add(pantsModel);
        }
      }

      if (outfit.accessory) {
        const accessoryModel = await loadModel(require('../../assets/models/accessory.obj'));
        if (accessoryModel) {
          accessoryModel.position.set(0.2, 0.5, -1.5);
          accessoryModel.scale.set(0.2, 0.2, 0.2);
          scene.add(accessoryModel);
        }
      }

      setIsARReady(true);
    } catch (error) {
      Alert.alert('AR Error', error.message);
    }
  };

  const onContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const r = new Renderer({ gl });
    r.setSize(width, height);

    const s = new Scene();
    const c = new PerspectiveCamera(75, width / height, 0.1, 1000);
    c.position.set(0, 0, 0);

    setRenderer(r);
    setScene(s);
    setCamera(c);
  };

  const onRender = () => {
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
      glViewRef.current?.requestAnimationFrame(onRender);
    }
  };

  useEffect(() => {
    if (isARReady) {
      onRender();
    }
  }, [isARReady]);

  if (hasPermission === null) {
    return <View />;
  }

  if (hasPermission === false) {
    return <View style={styles.container}><Text>No access to camera</Text></View>;
  }

  return (
    <View style={styles.container}>
      <GLView
        ref={glViewRef}
        style={styles.glView}
        onContextCreate={onContextCreate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glView: {
    flex: 1,
  },
});

export default ARTryOnScreen;
