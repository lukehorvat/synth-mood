import { assetCache } from './asset-cache';

export async function render(containerEl: Element): Promise<void> {
  const loadingEl = document.createElement('div');
  loadingEl.className = 'loading';
  containerEl.appendChild(loadingEl);

  for await (const message of assetCache.loadAssets()) {
    loadingEl.textContent = message;
  }

  loadingEl.textContent = 'Ready!';
  await new Promise((resolve) => setTimeout(resolve, 1000));
  loadingEl.remove();
}
