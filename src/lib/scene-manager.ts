import * as THREE from 'three';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import random from 'lodash/random';
import sample from 'lodash/sample';
import { Sound } from './sound';

export class SceneManager {
  private readonly cache: {
    fonts: Map<string, Font>;
    models: Map<string, THREE.Group>;
    sounds: Map<string, Sound>;
  };
  private readonly renderer: THREE.Renderer;
  private readonly camera: THREE.Camera;
  private readonly scene: THREE.Scene;
  private readonly color: THREE.Color;
  private readonly title: THREE.Mesh;
  private readonly gridTop: THREE.GridHelper;
  private readonly gridBottom: THREE.GridHelper;
  private readonly models: THREE.Group[];
  private readonly sounds: Set<Sound>;

  constructor(cache: {
    fonts: Map<string, Font>;
    models: Map<string, THREE.Group>;
    sounds: Map<string, Sound>;
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

    this.models = [];
    this.sounds = new Set();
  }

  render(containerEl: Element): void {
    containerEl.appendChild(this.renderer.domElement);
    requestAnimationFrame(this.animate.bind(this));
    this.spawnSound();
  }

  private animate(): void {
    this.animateGrid();
    this.animateTitle();
    this.animateModels();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
  }

  private animateGrid(): void {
    // Move grids closer to the camera. To make grids appear "infinite", reset
    // their position once they have travelled one grid row of distance.
    this.gridTop.position.z = this.gridBottom.position.z =
      this.gridTop.position.z < GRID_SIZE / GRID_DIVISIONS
        ? this.gridTop.position.z + 1
        : 0;
  }

  private animateTitle(): void {
    if (this.title.position.z <= 0) return;

    // Move title away from the camera until it reaches its resting position.
    this.title.position.z = Math.max(this.title.position.z - 5, 0);
  }

  private animateModels(): void {
    if (this.title.position.z > 0) return;

    // Move models closer to the camera. Destroy models once they have travelled
    // past the camera.
    this.models.forEach((model) => {
      if (model.position.z < this.camera.position.z) {
        model.position.z += 4;
      } else {
        this.models.shift();
        this.scene.remove(model);
      }
    });

    const lastModel = this.models[this.models.length - 1];
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
    this.models.push(model);
    this.scene.add(model);
  }

  private spawnSound(): void {
    const sound = sample(
      [...this.cache.sounds.values()].filter((sound) => !this.sounds.has(sound))
    )!;

    const removeTimeListener = sound.onTimeUpdate(() => {
      if (sound.getCurrentTime() >= sound.getDuration() * 0.65) {
        this.spawnSound();
        removeTimeListener();
      }
    });

    let loops = random(0, 2);
    const removeEndListener = sound.onEnded(() => {
      if (loops > 0) {
        sound.play();
        loops--;
      } else {
        this.sounds.delete(sound);
        removeEndListener();
      }
    });

    sound.play();
    this.sounds.add(sound);
  }

  private computeModelSpawnPosition(): [x: number, y: number, z: number] {
    const lastModel = this.models[this.models.length - 1];
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
