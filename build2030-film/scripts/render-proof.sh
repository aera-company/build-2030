#!/bin/zsh
# Render segmentado + concat (lição do playbook: render único longo falha por delayRender das fontes).
# Uso: scripts/render-proof.sh [COMPOSICAO] [NOME] [ULTIMO_FRAME]
set -e
setopt NULL_GLOB
cd "$(dirname "$0")/.."
COMP=${1:-BUILD2030-PROOF}
NAME=${2:-PROOF_V1}
LAST=${3:-809}
SEG=150
mkdir -p out/seg
rm -f out/seg/*
: > out/seg/list.txt
i=0
for ((start=0; start<=LAST; start+=SEG)); do
  end=$((start+SEG-1)); if ((end>LAST)); then end=$LAST; fi
  i=$((i+1))
  npx remotion render $COMP out/seg/seg$i.mp4 --frames=$start-$end --codec=h264 --crf=16 --concurrency=2 --timeout=180000 --muted
  echo "file 'seg$i.mp4'" >> out/seg/list.txt
done
ffmpeg -nostdin -v error -y -f concat -safe 0 -i out/seg/list.txt -c copy out/seg/_video.mp4
npx remotion render $COMP out/seg/_audio.wav --codec=wav --timeout=180000
ffmpeg -nostdin -v error -y -i out/seg/_video.mp4 -i out/seg/_audio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest out/GAVEA_BUILD2030_${NAME}_1080p.mp4
rm -rf out/seg
echo "RENDER DONE out/GAVEA_BUILD2030_${NAME}_1080p.mp4"
