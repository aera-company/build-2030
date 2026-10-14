#!/bin/zsh
# V3 · render final: vídeo em segmentos (mudo) + áudio em wav + mux com loudnorm (−14 LUFS, −1 dBTP).
# Uso: scripts/render-v3.sh [COMPOSICAO] [ARQUIVO_SAIDA] [ULTIMO_FRAME]
set -e
setopt NULL_GLOB
cd "$(dirname "$0")/.."
COMP=${1:-GAVEA-V3-PROOF}
OUTFILE=${2:-out/GAVEA_BUILD2030_MOTION_PROOF_V3_00-31.mp4}
LAST=${3:-929}
SEG=310
mkdir -p out/seg
rm -f out/seg/*
: > out/seg/list.txt
i=0
for ((start=0; start<=LAST; start+=SEG)); do
  end=$((start+SEG-1)); if ((end>LAST)); then end=$LAST; fi
  i=$((i+1))
  npx remotion render $COMP out/seg/seg$i.mp4 --frames=$start-$end --codec=h264 --crf=14 --concurrency=4 --timeout=180000 --muted
  echo "file 'seg$i.mp4'" >> out/seg/list.txt
done
ffmpeg -nostdin -v error -y -f concat -safe 0 -i out/seg/list.txt -c copy out/seg/_video.mp4
npx remotion render $COMP out/seg/_audio.wav --codec=wav --timeout=180000
# ganho estático (preserva o silêncio): mede a integrada e corrige para −14 LUFS; limitador a −1 dBTP
I=$(ffmpeg -nostdin -i out/seg/_audio.wav -af ebur128 -f null - 2>&1 | grep -A2 'Integrated loudness' | grep 'I:' | awk '{print $2}')
G=$(python3 -c "print(round(-14 - float('$I'), 2))")
echo "integrada $I LUFS · ganho $G dB"
ffmpeg -nostdin -v error -y -i out/seg/_audio.wav -af "volume=${G}dB,alimiter=limit=0.87:level=false" -ar 48000 out/seg/_audio_n.wav
ffmpeg -nostdin -v error -y -i out/seg/_video.mp4 -i out/seg/_audio_n.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest "$OUTFILE"
rm -rf out/seg
echo "RENDER DONE $OUTFILE"
