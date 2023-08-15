import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export default class extends Map {
  constructor(path = '') {
    super();

    this.path = path;
  }

  set(key, value) {
    if (value !== undefined) return super.set(key, value);

    return new Promise((resolve) => {
      let modelLoader = new OBJLoader();
      modelLoader.load(`${this.path}/${key}`, (model) => {
        this.set(key, model);
        resolve();
      });
    });
  }
}
