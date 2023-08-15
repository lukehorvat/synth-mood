import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';

export class FontCache {
  private readonly path: string;
  private readonly map: Map<string, Font>;

  constructor(path = '') {
    this.path = path;
    this.map = new Map<string, Font>();
  }

  get(key: string) {
    return this.map.get(key);
  }

  async set(key: string) {
    const fontLoader = new FontLoader();
    const font = await fontLoader.loadAsync(`${this.path}/${key}`);
    this.map.set(key, font);
  }

  values() {
    return this.map.values();
  }
}
