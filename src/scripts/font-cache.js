import Map from "es6-map/polyfill"; // Chrome has problems with extending Map. :(
import * as THREE from "three";

export default class extends Map {
  init(fontNames) {
    let fontLoader = new THREE.FontLoader();

    return Promise.all(
      fontNames.map(fontName => (
        new Promise(resolve => {
          fontLoader.load(`fonts/${fontName}.json`, font => {
            this.set(fontName, font);
            resolve();
          });
        })
      ))
    );
  }
}
