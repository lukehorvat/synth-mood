import { AssetCache } from './asset-cache';

export async function render(containerEl: Element): Promise<AssetCache> {
  const assetCache = new AssetCache();

  const loadingEl = document.createElement('div');
  loadingEl.className = 'loading';
  containerEl.appendChild(loadingEl);

  loadingEl.textContent = 'Loading fonts...';
  await assetCache.loadFonts();

  loadingEl.textContent = 'Loading models...';
  await assetCache.loadModels();

  loadingEl.textContent = 'Loading sounds...';
  await assetCache.loadSounds();

  loadingEl.remove();

  return assetCache;
}
