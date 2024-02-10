import * as THREE from 'three';
import { Font } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { SMSound } from 'soundmanager2';
import random from 'lodash/random';
import sample from 'lodash/sample';

export class SceneManager {
  private readonly cache: {
    fonts: Map<string, Font>;
    models: Map<string, THREE.Group>;
    sounds: Map<string, SMSound>;
  };
  private readonly renderer: THREE.Renderer;
  private readonly camera: THREE.Camera;
  private readonly scene: THREE.Scene;
  private readonly color: THREE.Color;
  private readonly title: THREE.Mesh;
  private readonly gridTop: THREE.GridHelper;
  private readonly gridBottom: THREE.GridHelper;
  private readonly models: THREE.Group[];
  private readonly sounds: SMSound[];

  constructor(cache: {
    fonts: Map<string, Font>;
    models: Map<string, THREE.Group>;
    sounds: Map<string, SMSound>;
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
    this.camera.position.x = 0;
    this.camera.position.y = 0;
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
      })
    );
    this.title.material = new THREE.MeshBasicMaterial({ color: this.color });
    this.title.geometry.computeBoundingBox(); // Compute bounding box so that text can be centered.
    this.title.position.x =
      this.title.geometry.boundingBox!.min.x -
      this.title.geometry.boundingBox!.max.x / 2;
    this.title.position.x -= 6; // FIXME: Text doesn't center properly; a bug in FontLoader?
    this.title.position.y =
      this.title.geometry.boundingBox!.min.y -
      this.title.geometry.boundingBox!.max.y / 2;
    this.title.position.z = this.camera.position.z + 250;
    this.scene.add(this.title);

    this.gridTop = new THREE.GridHelper(
      GRID_SIZE,
      GRID_DIVISIONS,
      this.color,
      this.color
    );
    this.gridTop.position.x = 0;
    this.gridTop.position.y = 125;
    this.gridTop.position.z = 0;
    this.scene.add(this.gridTop);

    this.gridBottom = new THREE.GridHelper(
      GRID_SIZE,
      GRID_DIVISIONS,
      this.color,
      this.color
    );
    this.gridBottom.position.x = 0;
    this.gridBottom.position.y = -125;
    this.gridBottom.position.z = 0;
    this.scene.add(this.gridBottom);

    this.models = [];
    this.sounds = [];
  }

  render(containerEl: Element): void {
    containerEl.appendChild(this.renderer.domElement);
    requestAnimationFrame(this.update.bind(this));
  }

  private update(): void {
    // Move grids closer to the camera.
    // To make grids appear "infinite", reset their position once they have travelled one grid row of distance.
    this.gridTop.position.z +=
      this.gridTop.position.z < GRID_SIZE / GRID_DIVISIONS
        ? 1
        : -this.gridTop.position.z;
    this.gridBottom.position.z +=
      this.gridBottom.position.z < GRID_SIZE / GRID_DIVISIONS
        ? 1
        : -this.gridBottom.position.z;

    if (this.title.position.z > 0) {
      // Move title away from the camera until it reaches its resting position.
      this.title.position.z = Math.max(this.title.position.z - 5, 0);
    } else {
      // Move models closer to the camera.
      // Destroy models once they have travelled past the camera.
      this.models.forEach((model) => {
        if (model.position.z < this.camera.position.z) {
          model.position.z += 4;
        } else {
          this.models.shift();
          this.scene.remove(model);
        }
      });

      // Spawn a new model?
      const lastModel = this.models[this.models.length - 1];
      if (!lastModel || lastModel.position.z > this.title.position.z + 60) {
        const model = sample([...this.cache.models.values()])!.clone();
        model.position.x =
          lastModel && lastModel.position.y === this.gridBottom.position.y
            ? -lastModel.position.x
            : random(
                this.title.position.x,
                this.title.position.x +
                  this.title.geometry.boundingBox!.max.x -
                  this.title.geometry.boundingBox!.min.x
              );
        model.position.y =
          lastModel && lastModel.position.y === this.gridBottom.position.y
            ? this.gridTop.position.y
            : this.gridBottom.position.y;
        model.position.z = this.title.position.z;
        model.scale.x = model.scale.y = model.scale.z = 15;
        model.children.forEach((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = new THREE.MeshBasicMaterial({ color: this.color });
          }
        });
        this.models.push(model);
        this.scene.add(model);
      }

      // Spawn a new sound?
      const lastSound = this.sounds[this.sounds.length - 1];
      if (!lastSound || lastSound.position > lastSound.duration * 0.65) {
        const sound = sample(
          [...this.cache.sounds.values()].filter(
            (sound) => !this.sounds.includes(sound)
          )
        )!;
        sound.repeats = random(0, 4);
        sound.onPosition(sound.duration * 0.95, () => {
          if (sound.repeats > 0) {
            sound.repeats--;
            sound.setPosition(0);
          }
        });
        sound.play({
          onfinish: () => {
            this.sounds.shift();
          },
          volume: 20,
        });
        this.sounds.push(sound);
      }
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.update.bind(this));
  }
}

const FIELD_OF_VIEW = 55;
const DRAW_DISTANCE = 1000;
const GRID_SIZE = 10000;
const GRID_DIVISIONS = 140;
