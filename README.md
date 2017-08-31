# Synth Mood

Sleep, study, and relax with the sound of synthesizers. Inspired by [RainyMood.com](http://rainymood.com)!

Live version hosted [here](https://synth.js.org).

![](https://i.imgur.com/YNpOpz9.gif)

## Setup

To run a local instance, issue the following commands:

```bash
$ git clone git@github.com:lukehorvat/synth-mood.git
$ cd synth-mood
$ npm install
$ npm start
```

This installs all dependencies and serves the Web app on port 9000.

## Contributing

Feel free to send me a pull request if you want to add your own synthesizer sounds. But please adhere to the following:

- Sounds are approximately 20 seconds in length.
- Sounds are in [Ogg](https://en.wikipedia.org/wiki/Ogg) format.
- Sounds are royalty-free.

Personally, I take the following approach:

1. Craft a sound in GarageBand (or another DAW).
2. Export sound as an uncompressed WAV file.
3. Convert WAV to Ogg using FFmpeg:

  ```bash
  ffmpeg -i sound.wav -c:a libvorbis -q:a 5 sound.ogg
  ```

At some point in the future, I will switch from audio files to [Web MIDI](https://www.w3.org/TR/webmidi/), in order to eliminate the long loading time.
