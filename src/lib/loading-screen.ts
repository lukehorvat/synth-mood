import * as THREE from 'three';
import { Font, FontLoader } from 'three/addons/loaders/FontLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { SMSound, soundManager } from 'soundmanager2';

export async function render(containerEl: Element): Promise<{
  fonts: Map<string, Font>;
  models: Map<string, THREE.Group>;
  sounds: Map<string, SMSound>;
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

async function loadSounds(): Promise<Map<string, SMSound>> {
  await new Promise<void>((resolve) => {
    if (soundManager.ok()) resolve();
    else soundManager.setup({ onready: resolve });
  });

  const sounds = new Map<string, SMSound>();
  const filenames = Array.from({ length: 26 }, (_, i) => `${i + 1}.ogg`);

  for (const filename of filenames) {
    await new Promise<void>((resolve) => {
      const sound = soundManager.createSound({
        id: `sound#${filename}`,
        url: `sounds/${filename}`,
        autoLoad: true,
        onload: resolve,
      });
      sounds.set(filename, sound);
    });
  }

  return sounds;
}
