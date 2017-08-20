import * as THREE from "three";

export default class {
  static cache = new Map();

  static fontLoader = new THREE.FontLoader();

  static init(fontNames) {
    return Promise.all(
      fontNames.map(fontName => (
        new Promise(resolve => {
          this.fontLoader.load(`fonts/${fontName}.json`, font => {
            this.cache.set(fontName, font);
            resolve();
          });
        })
      ))
    );
  }

  static get(fontName) {
    return this.cache.get(fontName);
  }
}
