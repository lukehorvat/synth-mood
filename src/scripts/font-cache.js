import Map from "es6-map/polyfill"; // Chrome has problems with extending Map. :(
import * as THREE from "three";

export default class extends Map {
  constructor(path = "") {
    super();

    this.path = path;
  }

  set(key, value) {
    if (value !== undefined) return super.set(key, value);

    return new Promise(resolve => {
      let fontLoader = new THREE.FontLoader();
      fontLoader.load(`${this.path}/${key}`, font => {
        this.set(key, font);
        resolve();
      });
    });
  }
}
