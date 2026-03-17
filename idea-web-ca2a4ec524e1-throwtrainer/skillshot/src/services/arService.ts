import * as THREE from 'three';
import { Renderer } from 'expo-three';
import ExpoTHREE from 'expo-three';

interface ARScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: Renderer;
  targetMesh: THREE.Mesh | null;
}

let arScene: ARScene | null = null;

export const initAR = async (gl: any): Promise<ARScene> => {
  const renderer = new Renderer({ gl });
  renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(
    75,
    gl.drawingBufferWidth / gl.drawingBufferHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 0);

  arScene = {
    scene,
    camera,
    renderer,
    targetMesh: null,
  };

  return arScene;
};

export const createTargetMesh = (position: { x: number; y: number; depth: number }): THREE.Mesh => {
  const geometry = new THREE.RingGeometry(0.1, 0.15, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  
  // Convert screen coordinates to 3D world position
  const worldX = (position.x - 0.5) * 2 * position.depth;
  const worldY = (0.5 - position.y) * 2 * position.depth;
  const worldZ = -position.depth;
  
  mesh.position.set(worldX, worldY, worldZ);
  mesh.lookAt(0, 0, 0);
  
  return mesh;
};

export const placeTarget = (position: { x: number; y: number; depth: number }) => {
  if (!arScene) return null;
  
  if (arScene.targetMesh) {
    arScene.scene.remove(arScene.targetMesh);
  }
  
  const targetMesh = createTargetMesh(position);
  arScene.scene.add(targetMesh);
  arScene.targetMesh = targetMesh;
  
  return {
    worldPosition: {
      x: targetMesh.position.x,
      y: targetMesh.position.y,
      z: targetMesh.position.z,
    },
  };
};

export const getTargetWorldPosition = (): { x: number; y: number; z: number } | null => {
  if (!arScene || !arScene.targetMesh) return null;
  
  return {
    x: arScene.targetMesh.position.x,
    y: arScene.targetMesh.position.y,
    z: arScene.targetMesh.position.z,
  };
};

export const renderAR = () => {
  if (!arScene) return;
  
  const { renderer, scene, camera } = arScene;
  renderer.render(scene, camera);
};

export const updateTargetFeedback = (result: 'hit' | 'miss') => {
  if (!arScene || !arScene.targetMesh) return;
  
  const material = arScene.targetMesh.material as THREE.MeshBasicMaterial;
  
  if (result === 'hit') {
    material.color.setHex(0x00ff00);
  } else {
    material.color.setHex(0xff0000);
  }
  
  setTimeout(() => {
    material.color.setHex(0xffffff);
  }, 500);
};
