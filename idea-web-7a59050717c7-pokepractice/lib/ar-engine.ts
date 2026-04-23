import * as THREE from 'three';
import { Renderer } from 'expo-three';

export class AREngine {
  private renderer: Renderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private targets: THREE.Mesh[] = [];
  private targetGeometry: THREE.SphereGeometry | null = null;
  private targetMaterial: THREE.MeshPhongMaterial | null = null;

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

    // Create reusable geometry and material for targets
    this.targetGeometry = new THREE.SphereGeometry(1, 32, 32);
    this.targetMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      shininess: 30,
      specular: 0x111111
    });
  }

  addTarget(position: { x: number, y: number, z: number }, radius: number = 0.1, color: THREE.Color = new THREE.Color(1, 0, 0)) {
    if (!this.scene || !this.targetGeometry || !this.targetMaterial) return;

    // Create a new mesh using the shared geometry and material
    const mesh = new THREE.Mesh(this.targetGeometry, this.targetMaterial);
    mesh.position.set(position.x, position.y, position.z);
    mesh.scale.set(radius, radius, radius);
    mesh.userData = { radius }; // Store radius for intersection testing

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

    if (intersects.length > 0) {
      // Check if the intersection is within the target's radius
      const intersect = intersects[0];
      const target = intersect.object as THREE.Mesh;
      const distance = intersect.distance;

      // Calculate if the intersection is within the target's radius
      if (distance <= target.userData.radius) {
        return target;
      }
    }

    return null;
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
