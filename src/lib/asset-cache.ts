import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class AssetCache {
  readonly fonts: Map<string, Font>;
  readonly models: Map<string, GLTF>;
  readonly sounds: Map<string, HTMLAudioElement>;

  constructor() {
    this.fonts = new Map();
    this.models = new Map();
    this.sounds = new Map();
  }

  async loadFonts(): Promise<void> {
    const filenames = ['Righteous_Regular.json'];
    const loader = new FontLoader();

    for (const filename of filenames) {
      const font = await loader.loadAsync(`fonts/${filename}`);
      this.fonts.set(filename, font);
    }
  }

  async loadModels(): Promise<void> {
    const filenames = [
      'half_note.glb',
      'quarter_note.glb',
      'double_eighth_note.glb',
      'double_sixteenth_note.glb',
    ];
    const loader = new GLTFLoader();

    for (const filename of filenames) {
      const model = await loader.loadAsync(`models/${filename}`);
      this.models.set(filename, model);
    }
  }

  async loadSounds(): Promise<void> {
    const filenames = Array.from({ length: 26 }, (_, i) => `${i + 1}.ogg`);

    for (const filename of filenames) {
      const sound = new Audio(`sounds/${filename}`);
      sound.preload = 'auto';
      sound.volume = 0.1;

      await new Promise<void>((resolve) => {
        sound.addEventListener('canplaythrough', () => {
          resolve();
        });
      });

      this.sounds.set(filename, sound);
    }
  }
}
