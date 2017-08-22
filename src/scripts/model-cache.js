import Map from "es6-map/polyfill"; // Chrome has problems with extending Map. :(
import * as THREE from "three";
import OBJLoader from "three-obj-loader";

OBJLoader(THREE);

export default class extends Map {
  init(modelNames) {
    let modelLoader = new THREE.OBJLoader();

    return Promise.all(
      modelNames.map(modelName => (
        new Promise(resolve => {
          modelLoader.load(`models/${modelName}.obj`, model => {
            this.set(modelName, model);
            resolve();
          });
        })
      ))
    );
  }
}
