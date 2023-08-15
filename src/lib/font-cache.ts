import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

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

  set(key: string, value?: Font) {
    if (value) {
      this.map.set(key, value);
      return;
    }

    return new Promise<void>((resolve) => {
      let fontLoader = new FontLoader();
      fontLoader.load(`${this.path}/${key}`, (font) => {
        this.set(key, font);
        resolve();
      });
    });
  }

  values() {
    return this.map.values();
  }
}
