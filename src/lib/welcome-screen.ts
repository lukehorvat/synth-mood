export function render(containerEl: Element): Promise<void> {
  return new Promise((resolve) => {
    const welcomeEl = document.createElement('div');
    welcomeEl.className = 'welcome';
    containerEl.appendChild(welcomeEl);

    const headingEl = document.createElement('h1');
    headingEl.textContent = 'Synth Mood';
    welcomeEl.appendChild(headingEl);

    const descriptionEl = document.createElement('p');
    descriptionEl.textContent =
      'Sleep, study, and relax with the sound of synthesizers.';
    welcomeEl.appendChild(descriptionEl);

    const startButton = document.createElement('button');
    startButton.textContent = 'Start';
    startButton.type = 'button';
    startButton.autofocus = true;
    startButton.addEventListener('click', () => {
      welcomeEl.remove();
      resolve();
    });
    welcomeEl.appendChild(startButton);
  });
}
