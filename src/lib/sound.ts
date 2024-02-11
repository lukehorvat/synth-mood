let context: AudioContext;

export class Sound {
  private readonly buffer: AudioBuffer;
  private readonly endedListeners: Set<() => void>;
  private source?: AudioBufferSourceNode;
  private gain?: GainNode;
  private startTime?: Date;

  constructor(buffer: AudioBuffer) {
    this.buffer = buffer;
    this.endedListeners = new Set();
  }

  play(options: { volume?: number } = {}): void {
    this.source = context.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.addEventListener('ended', () => {
      for (const listener of this.endedListeners) {
        listener();
      }
    });

    this.gain = context.createGain();
    this.gain.gain.value = options.volume ?? 1;

    this.source.connect(this.gain).connect(context.destination);
    this.source.start();

    this.startTime = new Date();
  }

  getCurrentTime(): number {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime.getTime();
  }

  getDuration(): number {
    return Math.round(this.buffer.duration * 1000);
  }

  onEnded(listener: () => void): () => void {
    this.endedListeners.add(listener);
    return () => this.endedListeners.delete(listener);
  }

  static init(): void {
    context = new AudioContext();
  }

  static async from(data: ArrayBuffer): Promise<Sound> {
    const buffer = await context.decodeAudioData(data);
    return new Sound(buffer);
  }
}
