import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import * as THREE from 'three';
import { Renderer } from 'expo-three';

interface ARTargetOverlayProps {
  position: { x: number; y: number; z: number };
  radius: number;
  isHit: boolean;
}

export const ARTargetOverlay: React.FC<ARTargetOverlayProps> = ({ position, radius, isHit }) => {
  const targetRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!targetRef.current) return;

    // Update target position
    targetRef.current.position.set(position.x, position.y, position.z);

    // Change color based on hit status
    if (isHit) {
      targetRef.current.material.color.setHex(0x00ff00);
    } else {
      targetRef.current.material.color.setHex(0xff0000);
    }
  }, [position, isHit]);

  const createTarget = (gl: WebGLRenderingContext) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    // Create renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    // Create scene
    const scene = new THREE.Scene();

    // Create camera
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 1000);
    camera.position.set(0, 0, 5);

    // Create target geometry
    const geometry = new THREE.CircleGeometry(radius, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });

    const target = new THREE.Mesh(geometry, material);
    target.position.set(position.x, position.y, position.z);
    target.rotation.x = -Math.PI / 2; // Rotate to face camera
    targetRef.current = target;

    scene.add(target);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
  };

  return (
    <View style={styles.container}>
      {/* This component would be used within the GLView context */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
