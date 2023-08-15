import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

export default class extends Map {
  constructor(path = '') {
    super();

    this.path = path;
  }

  set(key, value) {
    if (value !== undefined) return super.set(key, value);

    return new Promise((resolve) => {
      let fontLoader = new FontLoader();
      fontLoader.load(`${this.path}/${key}`, (font) => {
        this.set(key, font);
        resolve();
      });
    });
  }
}
