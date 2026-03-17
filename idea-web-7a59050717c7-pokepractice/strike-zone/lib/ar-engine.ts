import { Renderer } from 'expo-three';
import * as THREE from 'three';

export const initAREngine = (gl) => {
  const renderer = new Renderer({ gl });
  renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
  camera.position.z = 5;

  // Add some ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    gl.endFrameEXP();
  };

  animate();

  return { scene, camera, renderer };
};

export const addTarget = (scene, position) => {
  // Create a more visually appealing target
  const geometry = new THREE.TorusGeometry(0.1, 0.03, 16, 32);
  const material = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    shininess: 100,
    specular: 0xffffff
  });
  const target = new THREE.Mesh(geometry, material);
  target.position.set(position.x, position.y, position.z);

  // Add a wireframe for better visibility
  const wireframe = new THREE.WireframeGeometry(geometry);
  const line = new THREE.LineSegments(wireframe);
  line.material.depthTest = false;
  line.material.opacity = 0.25;
  line.material.transparent = true;
  target.add(line);

  scene.add(target);
  return target;
};

export const removeTarget = (scene, target) => {
  // Create particle effect when target is destroyed
  createParticleEffect(scene, target.position);

  // Remove the target from the scene
  scene.remove(target);
};

const createParticleEffect = (scene, position) => {
  const particleCount = 50;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    // Position
    positions[i * 3] = position.x + (Math.random() - 0.5) * 0.5;
    positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 0.5;
    positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 0.5;

    // Color (red to yellow gradient)
    colors[i * 3] = 1.0;
    colors[i * 3 + 1] = Math.random() * 0.5 + 0.5;
    colors[i * 3 + 2] = 0.0;

    // Size
    sizes[i] = Math.random() * 0.05 + 0.01;
  }

  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particles, particleMaterial);
  scene.add(particleSystem);

  // Animate particles
  const animateParticles = () => {
    const positions = particles.attributes.position.array;

    for (let i = 0; i < particleCount; i++) {
      // Move particles outward
      positions[i * 3] += (Math.random() - 0.5) * 0.02;
      positions[i * 3 + 1] += (Math.random() - 0.5) * 0.02;
      positions[i * 3 + 2] += (Math.random() - 0.5) * 0.02;

      // Fade out particles
      const size = particles.attributes.size.array[i];
      particles.attributes.size.array[i] = size * 0.95;
    }

    particles.attributes.position.needsUpdate = true;
    particles.attributes.size.needsUpdate = true;

    // Remove particle system when particles are too small
    if (particles.attributes.size.array.every(size => size < 0.001)) {
      scene.remove(particleSystem);
      return;
    }

    requestAnimationFrame(animateParticles);
  };

  animateParticles();
};
