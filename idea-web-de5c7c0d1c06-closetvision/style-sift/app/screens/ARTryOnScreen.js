import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer, TextureLoader, Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, Mesh } from 'expo-three';
import * as THREE from 'three';
import { Asset } from 'expo-asset';
import { AR } from 'expo';

const ARTryOnScreen = ({ route }) => {
  const { outfit } = route.params || {};
  const [renderer, setRenderer] = useState(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [models, setModels] = useState([]);
  const [isARReady, setIsARReady] = useState(false);
  const glViewRef = useRef(null);

  useEffect(() => {
    if (renderer && scene && camera && outfit) {
      setupARScene();
    }
  }, [renderer, scene, camera, outfit]);

  const setupARScene = async () => {
    try {
      // Clear previous models
      scene.children.forEach(child => {
        if (child instanceof Mesh) {
          scene.remove(child);
        }
      });

      // Create avatar (simplified as a box)
      const avatarGeometry = new BoxGeometry(0.5, 1.5, 0.3);
      const avatarMaterial = new MeshBasicMaterial({ color: 0x8B4513 }); // Brown color
      const avatar = new Mesh(avatarGeometry, avatarMaterial);
      avatar.position.set(0, -0.75, -1.5);
      scene.add(avatar);

      // Add clothing items based on outfit
      if (outfit.top) {
        const topGeometry = new BoxGeometry(0.4, 0.6, 0.1);
        const topMaterial = new MeshBasicMaterial({ color: 0xFF0000 }); // Red shirt
        const top = new Mesh(topGeometry, topMaterial);
        top.position.set(0, 0.2, -1.5);
        scene.add(top);
      }

      if (outfit.bottom) {
        const bottomGeometry = new BoxGeometry(0.4, 0.8, 0.1);
        const bottomMaterial = new MeshBasicMaterial({ color: 0x0000FF }); // Blue pants
        const bottom = new Mesh(bottomGeometry, bottomMaterial);
        bottom.position.set(0, -0.5, -1.5);
        scene.add(bottom);
      }

      if (outfit.accessory) {
        const accessoryGeometry = new BoxGeometry(0.2, 0.2, 0.1);
        const accessoryMaterial = new MeshBasicMaterial({ color: 0x00FF00 }); // Green accessory
        const accessory = new Mesh(accessoryGeometry, accessoryMaterial);
        accessory.position.set(0.2, 0.5, -1.5);
        scene.add(accessory);
      }

      // Set up AR session
      if (Platform.OS === 'ios') {
        await AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);
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
