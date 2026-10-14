#!/bin/zsh
# V5 · render: master de áudio contínuo (ganho estático para −14 LUFS + limitador), vídeo em segmentos mudos.
# Uso: scripts/render-v4.sh audio                         → out/v5/audio_master.wav
#      scripts/render-v4.sh video FIRST LAST SAIDA.mp4     → trecho com o áudio do master
#      scripts/render-v4.sh join A.mp4 B.mp4 SAIDA.mp4     → master final (vídeo das metades revisadas + áudio contínuo)
set -e
setopt NULL_GLOB
cd "$(dirname "$0")/.."
COMP=GAVEA-V5-FILM
mkdir -p out/v5
case $1 in
  audio)
    [[ $2 == keep ]] || npx remotion render $COMP out/v5/audio_raw.wav --codec=wav --timeout=180000 || npx remotion render $COMP out/v5/audio_raw.wav --codec=wav --timeout=180000
    I=$(ffmpeg -nostdin -i out/v5/audio_raw.wav -af ebur128 -f null - 2>&1 | grep -A2 'Integrated loudness' | grep 'I:' | awk '{print $2}')
    G=$(python3 -c "print(round(-14 - float('$I'), 2))")
    echo "integrada $I LUFS · ganho $G dB"
    ffmpeg -nostdin -v error -y -i out/v5/audio_raw.wav -af "volume=${G}dB,alimiter=limit=0.8:level=false" -ar 48000 out/v5/audio_master.wav
    ;;
  video)
    FIRST=$2; LAST=$3; OUT=$4; SEG=300
    D=out/v5/seg_$FIRST; rm -rf $D; mkdir -p $D; : > $D/list.txt; i=0
    for ((s=FIRST; s<=LAST; s+=SEG)); do
      e=$((s+SEG-1)); if ((e>LAST)); then e=$LAST; fi; i=$((i+1))
      npx remotion render $COMP $D/s$i.mp4 --frames=$s-$e --codec=h264 --crf=14 --concurrency=4 --timeout=180000 --muted || npx remotion render $COMP $D/s$i.mp4 --frames=$s-$e --codec=h264 --crf=14 --concurrency=4 --timeout=180000 --muted
      echo "file 's$i.mp4'" >> $D/list.txt
    done
    ffmpeg -nostdin -v error -y -f concat -safe 0 -i $D/list.txt -c copy $D/_video.mp4
    cp $D/_video.mp4 out/v5/video_$FIRST-$LAST.mp4
    T0=$(python3 -c "print($FIRST/30)"); TD=$(python3 -c "print(($LAST-$FIRST+1)/30)")
    ffmpeg -nostdin -v error -y -i $D/_video.mp4 -ss $T0 -t $TD -i out/v5/audio_master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k "$OUT"
    rm -rf $D
    echo "RENDER DONE $OUT"
    ;;
  join)
    # junta os vídeos mudos das metades revisadas (out/v5/video_*.mp4) e põe o áudio contínuo do master
    printf "file '%s'\nfile '%s'\n" "$PWD/$2" "$PWD/$3" > out/v5/join.txt
    ffmpeg -nostdin -v error -y -f concat -safe 0 -i out/v5/join.txt -c copy out/v5/_joined.mp4
    ffmpeg -nostdin -v error -y -i out/v5/_joined.mp4 -i out/v5/audio_master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k "$4"
    rm -f out/v5/_joined.mp4 out/v5/join.txt
    echo "JOIN DONE $4"
    ;;
esac
