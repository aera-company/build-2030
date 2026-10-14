#!/bin/zsh
# V4 · profundidade: cada som da família existe em três planos.
#   _f frente (seco) · _m meio (passa-baixa 5,2 kHz, reflexão curta, −3 dB) · _b fundo (passa-baixa 1,9 kHz, reflexão longa, −8 dB)
# Mundo: texturas do ElevenLabs Sound Effects normalizadas em −24 LUFS, grave limpo abaixo de 35 Hz.
# Uso: zsh scripts/make-sfx-depth.sh
set -e
mkdir -p public/audio/sfx4 public/audio/world
for f in public/audio/sfx/*.wav; do
  n=$(basename $f .wav)
  ffmpeg -v error -y -i $f -af "aresample=48000,highpass=f=25" -ac 2 public/audio/sfx4/${n}_f.wav
  ffmpeg -v error -y -i $f -af "aresample=48000,apad=pad_dur=0.35,lowpass=f=5200,aecho=0.8:0.6:38|71:0.22|0.12,volume=-3dB" -ac 2 public/audio/sfx4/${n}_m.wav
  ffmpeg -v error -y -i $f -af "aresample=48000,apad=pad_dur=0.6,lowpass=f=1900,aecho=0.8:0.7:60|120:0.3|0.2,volume=-8dB" -ac 2 public/audio/sfx4/${n}_b.wav
done
for f in public/audio/world/raw/*.mp3; do
  n=$(basename $f .mp3)
  ffmpeg -v error -y -i $f -af "aresample=48000,highpass=f=35,lowpass=f=9000,loudnorm=I=-24:TP=-6:LRA=11" -ac 2 -ar 48000 public/audio/world/${n}.wav
done
echo ok
