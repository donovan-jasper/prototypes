import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';

interface ARTargetOverlayProps {
  targets: Array<{ x: number; y: number; z: number; id: string }>;
  onTargetPlaced?: (target: { x: number; y: number; z: number }) => void;
}

export const ARTargetOverlay: React.FC<ARTargetOverlayProps> = ({ targets, onTargetPlaced }) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const targetMeshesRef = useRef<Array<THREE.Mesh>>([]);
  const targetGroupRef = useRef<THREE.Group>(new THREE.Group());

  useEffect(() => {
    // Clean up when component unmounts
    return () => {
      if (sceneRef.current) {
        targetMeshesRef.current.forEach(mesh => {
          targetGroupRef.current.remove(mesh);
        });
      }
    };
  }, []);

  const initializeScene = (gl: WebGLRenderingContext) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;

    // Create renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(70, width / height, 0.01, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Add target group to scene
    scene.add(targetGroupRef.current);

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

  // Update targets when props change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove all existing targets
    targetMeshesRef.current.forEach(mesh => {
      targetGroupRef.current.remove(mesh);
    });
    targetMeshesRef.current = [];

    // Add new targets
    targets.forEach(target => {
      const targetMesh = createTargetMesh(target);
      targetMeshesRef.current.push(targetMesh);
      targetGroupRef.current.add(targetMesh);
    });
  }, [targets]);

  return (
    <GLView
      style={StyleSheet.absoluteFill}
      onContextCreate={initializeScene}
    />
  );
};
