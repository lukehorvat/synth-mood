import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

export class ModelCache {
  private readonly path: string;
  private readonly map: Map<string, THREE.Group>;

  constructor(path = '') {
    this.path = path;
    this.map = new Map<string, THREE.Group>();
  }

  get(key: string): THREE.Group | undefined {
    return this.map.get(key);
  }

  async set(key: string): Promise<void> {
    const modelLoader = new OBJLoader();
    const model = await modelLoader.loadAsync(`${this.path}/${key}`);
    this.map.set(key, model);
  }

  values(): THREE.Group[] {
    return [...this.map.values()];
  }
}
