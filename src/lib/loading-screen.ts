import * as THREE from 'three';
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { Sound } from './sound';

export async function render(containerEl: Element): Promise<{
  fonts: Map<string, Font>;
  models: Map<string, THREE.Group>;
  sounds: Map<string, Sound>;
}> {
  const loadingEl = document.createElement('div');
  loadingEl.className = 'loading';
  containerEl.appendChild(loadingEl);

  loadingEl.textContent = 'Loading fonts...';
  const fonts = await loadFonts();

  loadingEl.textContent = 'Loading models...';
  const models = await loadModels();

  loadingEl.textContent = 'Loading sounds...';
  const sounds = await loadSounds();

  loadingEl.remove();

  return { fonts, models, sounds };
}

async function loadFonts(): Promise<Map<string, Font>> {
  const fonts = new Map<string, Font>();
  const filenames = ['Righteous_Regular.json'];
  const loader = new FontLoader();

  for (const filename of filenames) {
    const font = await loader.loadAsync(`fonts/${filename}`);
    fonts.set(filename, font);
  }

  return fonts;
}

async function loadModels(): Promise<Map<string, THREE.Group>> {
  const models = new Map<string, THREE.Group>();
  const loader = new OBJLoader();
  const filenames = Array.from({ length: 4 }, (_, i) => `${i + 1}.obj`);

  for (const filename of filenames) {
    const model = await loader.loadAsync(`models/${filename}`);
    models.set(filename, model);
  }

  return models;
}

async function loadSounds(): Promise<Map<string, Sound>> {
  Sound.init();

  const sounds = new Map<string, Sound>();
  const filenames = Array.from({ length: 26 }, (_, i) => `${i + 1}.ogg`);

  for (const filename of filenames) {
    const response = await fetch(`sounds/${filename}`);
    const data = await response.arrayBuffer();
    const sound = await Sound.from(data);
    sounds.set(filename, sound);
  }

  return sounds;
}
