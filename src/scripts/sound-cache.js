import { soundManager } from "soundmanager2";

export default class {
  static cache = new Map();

  static init(soundNames) {
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
              url: `sounds/${soundName}.mp3`,
              autoLoad: true,
              onload: resolve
            });
            this.cache.set(soundName, sound);
          })
        ))
      )
    ));
  }

  static get(soundName) {
    return this.cache.get(soundName);
  }
}
