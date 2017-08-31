import Map from "es6-map/polyfill"; // Chrome has problems with extending Map. :(
import * as THREE from "three";
import OBJLoader from "three-obj-loader";

OBJLoader(THREE);

export default class extends Map {
  constructor(path = "") {
    super();

    this.path = path;
  }

  set(key, value) {
    if (value !== undefined) return super.set(key, value);

    return new Promise(resolve => {
      let modelLoader = new THREE.OBJLoader();
      modelLoader.load(`${this.path}/${key}`, model => {
        this.set(key, model);
        resolve();
      });
    });
  }
}
