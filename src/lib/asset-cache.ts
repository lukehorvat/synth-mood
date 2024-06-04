import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class AssetCache {
  readonly fonts: Map<string, Font>;
  readonly models: Map<string, GLTF>;
  readonly sounds: Map<string, HTMLAudioElement>;
  private readonly fontLoader: FontLoader;
  private readonly modelLoader: GLTFLoader;

  constructor() {
    this.fonts = new Map();
    this.models = new Map();
    this.sounds = new Map();
    this.fontLoader = new FontLoader();
    this.modelLoader = new GLTFLoader();
  }

  async *loadAssets(): AsyncGenerator<string> {
    for (const filename of FONT_FILENAMES) {
      yield `Loading font "${filename}"...`;
      await this.loadFont(filename);
    }

    for (const filename of MODEL_FILENAMES) {
      yield `Loading model "${filename}"...`;
      await this.loadModel(filename);
    }

    for (const filename of SOUND_FILENAMES) {
      yield `Loading sound "${filename}"...`;
      await this.loadSound(filename);
    }
  }

  private async loadFont(filename: string): Promise<void> {
    if (this.fonts.has(filename)) return;

    const font = await this.fontLoader.loadAsync(`fonts/${filename}`);
    this.fonts.set(filename, font);
  }

  private async loadModel(filename: string): Promise<void> {
    if (this.models.has(filename)) return;

    const model = await this.modelLoader.loadAsync(`models/${filename}`);
    this.models.set(filename, model);
  }

  private async loadSound(filename: string): Promise<void> {
    if (this.sounds.has(filename)) return;

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

export const assetCache = new AssetCache(); // singleton

const FONT_FILENAMES = ['Righteous_Regular.json'];

const MODEL_FILENAMES = [
  'half_note.glb',
  'quarter_note.glb',
  'double_eighth_note.glb',
  'double_sixteenth_note.glb',
];

const SOUND_FILENAMES = Array.from({ length: 26 }, (_, i) => `${i + 1}.ogg`);
