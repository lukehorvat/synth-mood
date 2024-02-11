export class Sound {
  private readonly audioEl: HTMLAudioElement;

  constructor(audioEl: HTMLAudioElement) {
    this.audioEl = audioEl;
  }

  play(): void {
    void this.audioEl.play();
  }

  getCurrentTime(): number {
    return this.audioEl.currentTime;
  }

  getDuration(): number {
    return this.audioEl.duration;
  }

  onEnded(listener: () => void): () => void {
    this.audioEl.addEventListener('ended', listener);
    return () => {
      this.audioEl.removeEventListener('ended', listener);
    };
  }

  onTimeUpdate(listener: () => void): () => void {
    this.audioEl.addEventListener('timeupdate', listener);
    return () => {
      this.audioEl.removeEventListener('timeupdate', listener);
    };
  }
}
