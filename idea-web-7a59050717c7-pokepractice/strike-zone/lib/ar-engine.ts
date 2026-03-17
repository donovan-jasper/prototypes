import { Renderer } from 'expo-three';
import * as THREE from 'three';

export const initAREngine = (gl) => {
  const renderer = new Renderer({ gl });
  renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
  camera.position.z = 5;

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    gl.endFrameEXP();
  };

  animate();

  return { scene, camera, renderer };
};

export const addTarget = (scene, position) => {
  const geometry = new THREE.SphereGeometry(0.1, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const target = new THREE.Mesh(geometry, material);
  target.position.set(position.x, position.y, position.z);
  scene.add(target);
  return target;
};

export const removeTarget = (scene, target) => {
  scene.remove(target);
};
