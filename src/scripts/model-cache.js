import * as THREE from "three";
import OBJLoader from "three-obj-loader";

OBJLoader(THREE);

export default class {
  static cache = new Map();

  static modelLoader = new THREE.OBJLoader();

  static init(modelNames) {
    return Promise.all(
      modelNames.map(modelName => (
        new Promise(resolve => {
          this.modelLoader.load(`models/${modelName}.obj`, model => {
            this.cache.set(modelName, model);
            resolve();
          });
        })
      ))
    );
  }

  static get(modelName) {
    return this.cache.get(modelName).clone();
  }
}
