import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';

export const initAR = async (gl) => {
  const renderer = new Renderer({ gl });
  renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

  // Placeholder for AR initialization
  return renderer;
};

export const renderAR = (renderer, scene, camera) => {
  renderer.render(scene, camera);
};
