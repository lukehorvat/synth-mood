import Map from "es6-map/polyfill"; // Chrome has problems with extending Map. :(
import { soundManager } from "soundmanager2";

export default class extends Map {
  constructor(path = "") {
    super();

    this.path = path;
  }

  set(key, value) {
    if (value !== undefined) return super.set(key, value);

    return new Promise(resolve => {
      if (soundManager.ok()) resolve();
      else soundManager.setup({ onready: resolve });
    }).then(() => (
      new Promise(resolve => {
        let sound = soundManager.createSound({
          id: `sound#${key}`,
          url: `${this.path}/${key}`,
          autoLoad: true,
          onload: resolve
        });
        this.set(key, sound);
      })
    ));
  }
}
