import * as THREE from 'three';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import random from 'lodash/random';
import sample from 'lodash/sample';

export class SceneManager {
  private readonly cache: {
    fonts: Map<string, Font>;
    models: Map<string, THREE.Group>;
    sounds: Map<string, HTMLAudioElement>;
  };
  private readonly renderer: THREE.Renderer;
  private readonly camera: THREE.Camera;
  private readonly scene: THREE.Scene;
  private readonly clock: THREE.Clock;
  private readonly color: THREE.Color;
  private readonly title: THREE.Mesh;
  private readonly gridTop: THREE.GridHelper;
  private readonly gridBottom: THREE.GridHelper;
  private readonly spawnedModels: Set<THREE.Group>;
  private readonly spawnedSounds: Set<HTMLAudioElement>;

  constructor(cache: {
    fonts: Map<string, Font>;
    models: Map<string, THREE.Group>;
    sounds: Map<string, HTMLAudioElement>;
  }) {
    this.cache = cache;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(
      FIELD_OF_VIEW,
      window.innerWidth / window.innerHeight,
      1,
      DRAW_DISTANCE
    );
    this.camera.position.z = DRAW_DISTANCE;

    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.color = new THREE.Color(
      getComputedStyle(document.body).getPropertyValue('--primary-color')
    );

    this.title = new THREE.Mesh(
      new TextGeometry('SYNTH MOOD', {
        font: this.cache.fonts.get('Righteous_Regular.json')!,
        size: 110,
        height: 1,
      }).center()
    );
    this.title.material = new THREE.MeshBasicMaterial({ color: this.color });
    this.title.position.x -= 12; // FIXME: Text doesn't center properly; a bug in FontLoader?
    this.title.position.z = this.camera.position.z + 250;
    this.scene.add(this.title);

    this.gridTop = new THREE.GridHelper(
      GRID_SIZE,
      GRID_DIVISIONS,
      this.color,
      this.color
    );
    this.gridTop.position.y = 125;
    this.scene.add(this.gridTop);

    this.gridBottom = this.gridTop.clone();
    this.gridBottom.position.y = -125;
    this.scene.add(this.gridBottom);

    this.spawnedModels = new Set();
    this.spawnedSounds = new Set();
  }

  render(containerEl: Element): void {
    containerEl.appendChild(this.renderer.domElement);
    requestAnimationFrame(this.animate.bind(this));
    this.spawnSound();
  }

  private animate(): void {
    const delta = this.clock.getDelta();
    this.animateGrid(delta);
    this.animateTitle(delta);
    this.animateModels(delta);
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }

  private animateGrid(delta: number): void {
    // Move grids closer to the camera. To make grids appear "infinite", reset
    // their position once they have travelled one grid row of distance.
    this.gridTop.position.z = this.gridBottom.position.z =
      this.gridTop.position.z < GRID_SIZE / GRID_DIVISIONS
        ? this.gridTop.position.z + 100 * delta
        : 0;
  }

  private animateTitle(delta: number): void {
    if (this.title.position.z <= 0) return;

    // Move title away from the camera until it reaches its resting position.
    this.title.position.z = Math.max(this.title.position.z - 350 * delta, 0);
  }

  private animateModels(delta: number): void {
    if (this.title.position.z > 0) return;

    // Move models closer to the camera; destroy them when they travel past it.
    this.spawnedModels.forEach((model) => {
      if (model.position.z < this.camera.position.z) {
        model.position.z += 250 * delta;
      } else {
        this.spawnedModels.delete(model);
        this.scene.remove(model);
      }
    });

    const lastModel = [...this.spawnedModels].pop();
    if (!lastModel || lastModel.position.z > this.title.position.z + 60) {
      this.spawnModel();
    }
  }

  private spawnModel(): void {
    const model = sample([...this.cache.models.values()])!.clone();
    model.position.set(...this.computeModelSpawnPosition());
    model.scale.x = model.scale.y = model.scale.z = 15;
    model.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshBasicMaterial({ color: this.color });
      }
    });
    this.spawnedModels.add(model);
    this.scene.add(model);
  }

  private spawnSound(): void {
    const sound = sample(
      [...this.cache.sounds.values()].filter(
        (sound) => !this.spawnedSounds.has(sound)
      )
    )!;

    const timeListener = () => {
      if (sound.currentTime >= sound.duration * 0.65) {
        this.spawnSound();
        sound.removeEventListener('timeupdate', timeListener);
      }
    };
    sound.addEventListener('timeupdate', timeListener);

    let loops = random(0, 2);
    const endListener = () => {
      if (loops > 0) {
        void sound.play();
        loops--;
      } else {
        this.spawnedSounds.delete(sound);
        sound.removeEventListener('ended', endListener);
      }
    };
    sound.addEventListener('ended', endListener);

    void sound.play();
    this.spawnedSounds.add(sound);
  }

  private computeModelSpawnPosition(): [x: number, y: number, z: number] {
    const lastModel = [...this.spawnedModels].pop();
    const x =
      lastModel?.position.y === this.gridBottom.position.y
        ? -lastModel.position.x
        : this.title.position.x +
          random(
            this.title.geometry.boundingBox!.min.x,
            this.title.geometry.boundingBox!.max.x
          );
    const y =
      lastModel?.position.y === this.gridBottom.position.y
        ? this.gridTop.position.y
        : this.gridBottom.position.y;
    const z = this.title.position.z;
    return [x, y, z];
  }
}

const FIELD_OF_VIEW = 55;
const DRAW_DISTANCE = 1000;
const GRID_SIZE = 10000;
const GRID_DIVISIONS = 140;
