import { soundManager } from 'soundmanager2';

export class SoundCache {
  private readonly path: string;
  private readonly map: Map<string, SMSound>;

  constructor(path = '') {
    this.path = path;
    this.map = new Map<string, SMSound>();
  }

  get(key: string): SMSound | undefined {
    return this.map.get(key);
  }

  async set(key: string): Promise<void> {
    await new Promise<void>((resolve) => {
      if (soundManager.ok()) resolve();
      else soundManager.setup({ onready: resolve });
    });

    await new Promise<void>((resolve) => {
      const sound = soundManager.createSound({
        id: `sound#${key}`,
        url: `${this.path}/${key}`,
        autoLoad: true,
        onload: resolve,
      });
      this.map.set(key, sound);
    });
  }

  values(): SMSound[] {
    return [...this.map.values()];
  }
}

export type SMSound = any;
