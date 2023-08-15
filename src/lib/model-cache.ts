import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export class ModelCache {
  private readonly path: string;
  private readonly map: Map<string, THREE.Group>;

  constructor(path = '') {
    this.path = path;
    this.map = new Map<string, THREE.Group>();
  }

  get(key: string) {
    return this.map.get(key);
  }

  set(key: string, value?: THREE.Group) {
    if (value) {
      this.map.set(key, value);
      return;
    }

    return new Promise<void>((resolve) => {
      let modelLoader = new OBJLoader();
      modelLoader.load(`${this.path}/${key}`, (model) => {
        this.set(key, model);
        resolve();
      });
    });
  }

  values() {
    return this.map.values();
  }
}
