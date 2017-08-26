import Map from "es6-map/polyfill"; // Chrome has problems with extending Map. :(
import { soundManager } from "soundmanager2";

export default class extends Map {
  init(soundNames) {
    return new Promise(resolve => {
      soundManager.setup({
        debugMode: false,
        onready: resolve
      });
    }).then(() => (
      Promise.all(
        soundNames.map(soundName => (
          new Promise(resolve => {
            let sound = soundManager.createSound({
              url: `sounds/${soundName}.ogg`,
              autoLoad: true,
              onload: resolve
            });
            this.set(soundName, sound);
          })
        ))
      )
    ));
  }
}
