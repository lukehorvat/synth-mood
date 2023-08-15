import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

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

  async set(key: string) {
    const modelLoader = new OBJLoader();
    const model = await modelLoader.loadAsync(`${this.path}/${key}`);
    this.map.set(key, model);
  }

  values() {
    return this.map.values();
  }
}
