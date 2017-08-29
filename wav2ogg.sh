#!/usr/bin/env bash

printf "Converting sounds from WAV to Ogg...\n\n"

cd "$PWD/src/sounds"

for file in *.wav
do
  ffmpeg -i $file -c:a libvorbis -q:a 5 -y $(basename $file .wav).ogg
done

printf "\nDone!\n"
