import React from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

interface ARTargetOverlayProps {
  targets: Array<{ x: number; y: number; z: number; id: string }>;
}

export const ARTargetOverlay: React.FC<ARTargetOverlayProps> = ({ targets }) => {
  const initializeScene = (gl: WebGLRenderingContext) => {
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

    // Create targets
    targets.forEach(target => {
      const targetMesh = createTargetMesh(target);
      scene.add(targetMesh);
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
  };

  const createTargetMesh = (target: { x: number; y: number; z: number }): THREE.Mesh => {
    // Create target ring
    const ringGeometry = new THREE.RingGeometry(0.5, 0.6, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);

    // Create center dot
    const dotGeometry = new THREE.CircleGeometry(0.1, 32);
    const dotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const dot = new THREE.Mesh(dotGeometry, dotMaterial);

    // Combine into a group
    const targetGroup = new THREE.Group();
    targetGroup.add(ring);
    targetGroup.add(dot);
    targetGroup.position.set(target.x, target.y, target.z);

    return targetGroup;
  };

  return (
    <GLView
      style={StyleSheet.absoluteFill}
      onContextCreate={initializeScene}
    />
  );
};
