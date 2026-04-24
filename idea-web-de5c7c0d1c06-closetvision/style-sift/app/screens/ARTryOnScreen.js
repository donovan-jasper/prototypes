import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer, TextureLoader, Scene, PerspectiveCamera, BoxGeometry, MeshBasicMaterial, Mesh } from 'expo-three';
import * as THREE from 'three';
import { Asset } from 'expo-asset';
import { AR } from 'expo';

const ARTryOnScreen = () => {
  const [renderer, setRenderer] = useState(null);
  const [scene, setScene] = useState(null);
  const [camera, setCamera] = useState(null);
  const [shirtModel, setShirtModel] = useState(null);
  const [isARReady, setIsARReady] = useState(false);
  const glViewRef = useRef(null);

  useEffect(() => {
    if (renderer && scene && camera) {
      setupARScene();
    }
  }, [renderer, scene, camera]);

  const setupARScene = async () => {
    try {
      // Load shirt model (simplified for demo)
      const shirtGeometry = new BoxGeometry(0.5, 0.7, 0.1);
      const shirtMaterial = new MeshBasicMaterial({ color: 0xff0000 });
      const shirt = new Mesh(shirtGeometry, shirtMaterial);
      shirt.position.set(0, -0.5, -1.5);
      scene.add(shirt);
      setShirtModel(shirt);

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
