#!/usr/bin/env bash
# Hero film -> web budget. Source is 4K/4s/8.65MB; the brief caps it at 3s and
# 1.5MB. Audio is stripped (the hero is muted by spec) and faststart moves the
# moov atom to the front so playback can begin before the file finishes.
set -euo pipefail
SRC="${1:?usage: transcode-hero.sh <source.mp4>}"
FF="./node_modules/ffmpeg-static/ffmpeg.exe"

"$FF" -y -i "$SRC" -t 3 -vf "scale=1920:-2" \
  -c:v libx264 -preset slow -crf 30 -profile:v high -pix_fmt yuv420p \
  -movflags +faststart -an public/hero/hero.mp4

"$FF" -y -i "$SRC" -t 3 -vf "scale=1280:-2" \
  -c:v libvpx-vp9 -b:v 0 -crf 42 -row-mt 1 -an public/hero/hero.webm
