import * as THREE from 'three';
import { Renderer } from 'expo-three';

export class AREngine {
  private renderer: Renderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private targets: THREE.Mesh[] = [];

  initialize(gl: WebGLRenderingContext) {
    if (!gl) return;

    // Initialize Three.js renderer
    this.renderer = new Renderer({ gl });
    this.renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    // Create scene
    this.scene = new THREE.Scene();

    // Create camera
    this.camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
    this.camera.position.z = 0;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    this.scene.add(directionalLight);
  }

  addTarget(position: { x: number, y: number, z: number }, radius: number = 0.1, color: THREE.Color = new THREE.Color(Math.random(), Math.random(), Math.random())) {
    if (!this.scene) return;

    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);
    this.scene.add(mesh);
    this.targets.push(mesh);
    return mesh;
  }

  removeTarget(mesh: THREE.Mesh) {
    if (!this.scene) return;

    this.scene.remove(mesh);
    this.targets = this.targets.filter(target => target !== mesh);
  }

  checkIntersection(raycaster: THREE.Raycaster) {
    if (!this.scene || !this.camera) return null;

    const intersects = raycaster.intersectObjects(this.targets);
    return intersects.length > 0 ? intersects[0].object : null;
  }

  render() {
    if (!this.renderer || !this.scene || !this.camera) return;

    this.renderer.render(this.scene, this.camera);
  }

  cleanup() {
    if (this.scene) {
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }
    }
    this.targets = [];
  }

  get camera() {
    return this.camera;
  }
}
