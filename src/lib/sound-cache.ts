import { soundManager } from 'soundmanager2';

export class SoundCache {
  private readonly path: string;
  private readonly map: Map<string, SMSound>;

  constructor(path = '') {
    this.path = path;
    this.map = new Map<string, SMSound>();
  }

  get(key: string) {
    return this.map.get(key);
  }

  set(key: string, value?: SMSound) {
    if (value) {
      this.map.set(key, value);
      return;
    }

    return new Promise<void>((resolve) => {
      if (soundManager.ok()) resolve();
      else soundManager.setup({ onready: resolve });
    }).then(
      () =>
        new Promise<void>((resolve) => {
          let sound = soundManager.createSound({
            id: `sound#${key}`,
            url: `${this.path}/${key}`,
            autoLoad: true,
            onload: resolve,
          });
          this.set(key, sound);
        })
    );
  }

  values() {
    return this.map.values();
  }
}

export type SMSound = any;
