export function render(containerEl: Element): Promise<void> {
  return new Promise((resolve) => {
    const welcomeEl = document.createElement('div');
    welcomeEl.className = 'welcome';
    containerEl.appendChild(welcomeEl);

    const startButton = document.createElement('button');
    startButton.textContent = 'Enter synthesizer meditation zone';
    startButton.type = 'button';
    startButton.autofocus = true;
    startButton.addEventListener('click', () => {
      welcomeEl.remove();
      resolve();
    });
    welcomeEl.appendChild(startButton);

    const forkLink = document.createElement('a');
    forkLink.className = 'fork';
    forkLink.textContent = 'source code';
    forkLink.href = 'https://github.com/lukehorvat/synth-mood';
    containerEl.appendChild(forkLink);
  });
}
