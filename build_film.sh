#!/usr/bin/env bash
set -euo pipefail

echo "==================================================="
echo "Continuous Film Assembly & Web Optimization Builder"
echo "==================================================="

# 1. Locate FFmpeg
if command -v ffmpeg >/dev/null 2>&1; then
    FFMPEG="ffmpeg"
elif [[ -n "${LOCALAPPDATA:-}" ]] && [[ -f "$LOCALAPPDATA/Microsoft/WinGet/Links/ffmpeg.exe" ]]; then
    FFMPEG="$LOCALAPPDATA/Microsoft/WinGet/Links/ffmpeg.exe"
else
    echo "[ERROR] FFmpeg is not installed or not in PATH!"
    echo "Install with: winget install Gyan.FFmpeg (Windows) or brew/apt install ffmpeg (macOS/Linux)"
    exit 1
fi

echo "[INFO] Using FFmpeg: $FFMPEG"

# 2. Ensure destination directories exist
mkdir -p "site/media"
mkdir -p "clips"

# 3. Check for clip files (clips/clip1.mp4 ... clips/clip6.mp4)
if [[ ! -f "clips/clip1.mp4" ]]; then
    echo "[INFO] Setting up clips directory from source files..."
    [[ -f "Clips/Man_turns_and_smiles_8f1ac229_1080p.mp4" ]] && cp -f "Clips/Man_turns_and_smiles_8f1ac229_1080p.mp4" "clips/clip1.mp4" || true
    [[ -f "Clips/Person_stepping_toward_camera_5af44f70_1080p.mp4" ]] && cp -f "Clips/Person_stepping_toward_camera_5af44f70_1080p.mp4" "clips/clip2.mp4" || true
    [[ -f "Clips/Person_sitting_on_chair_32862b03_1080p.mp4" ]] && cp -f "Clips/Person_sitting_on_chair_32862b03_1080p.mp4" "clips/clip3.mp4" || true
    [[ -f "Clips/Man_stands_up_and_smiles_ac9b38ec_1080p.mp4" ]] && cp -f "Clips/Man_stands_up_and_smiles_ac9b38ec_1080p.mp4" "clips/clip4.mp4" || true
    [[ -f "Clips/2nd_last_9bb2955b_t0-8.mp4" ]] && cp -f "Clips/2nd_last_9bb2955b_t0-8.mp4" "clips/clip5.mp4" || true
    [[ -f "Clips/Man_pulling_screen_and_waving_5023da03_1080p.mp4" ]] && cp -f "Clips/Man_pulling_screen_and_waving_5023da03_1080p.mp4" "clips/clip6.mp4" || true
fi

for i in 1 2 3 4 5 6; do
    if [[ ! -f "clips/clip${i}.mp4" ]]; then
        echo "[ERROR] Missing clips/clip${i}.mp4!"
        exit 1
    fi
done

echo
echo "[1/4] Building film_master.mp4 (CRF 17, no audio, delogo, colorlevels, 0.25s xfades)..."
echo "Watermark: Veo primary star at x=1805, y=960, w=85, h=80; inner star at x=1700, y=860, w=80, h=80"

FILTER=""
FILTER="${FILTER}[0:v]scale=1920:1080:flags=bicubic,setsar=1,fps=24,delogo=x=1805:y=960:w=85:h=80,delogo=x=1700:y=860:w=80:h=80[v0];"
FILTER="${FILTER}[1:v]scale=1920:1080:flags=bicubic,setsar=1,fps=24,delogo=x=1805:y=960:w=85:h=80,delogo=x=1700:y=860:w=80:h=80[v1];"
FILTER="${FILTER}[2:v]scale=1920:1080:flags=bicubic,setsar=1,fps=24,delogo=x=1805:y=960:w=85:h=80,delogo=x=1700:y=860:w=80:h=80[v2];"
FILTER="${FILTER}[3:v]scale=1920:1080:flags=bicubic,setsar=1,fps=24,delogo=x=1805:y=960:w=85:h=80,delogo=x=1700:y=860:w=80:h=80[v3];"
FILTER="${FILTER}[4:v]scale=1920:1080:flags=bicubic,setsar=1,fps=24,delogo=x=1805:y=960:w=85:h=80,delogo=x=1700:y=860:w=80:h=80[v4];"
FILTER="${FILTER}[5:v]scale=1920:1080:flags=bicubic,setsar=1,fps=24,delogo=x=1805:y=960:w=85:h=80,delogo=x=1700:y=860:w=80:h=80[v5];"
FILTER="${FILTER}[v0][v1]xfade=transition=fade:duration=0.25:offset=7.666667[x1];"
FILTER="${FILTER}[x1][v2]xfade=transition=fade:duration=0.25:offset=15.333333[x2];"
FILTER="${FILTER}[x2][v3]xfade=transition=fade:duration=0.25:offset=23.000000[x3];"
FILTER="${FILTER}[x3][v4]xfade=transition=fade:duration=0.25:offset=30.666667[x4];"
FILTER="${FILTER}[x4][v5]xfade=transition=fade:duration=0.25:offset=38.416667,colorlevels=rimin=0.045:gimin=0.045:bimin=0.045,format=yuv420p[vout]"

"$FFMPEG" -y \
  -i clips/clip1.mp4 \
  -i clips/clip2.mp4 \
  -i clips/clip3.mp4 \
  -i clips/clip4.mp4 \
  -i clips/clip5.mp4 \
  -i clips/clip6.mp4 \
  -filter_complex "$FILTER" \
  -map "[vout]" \
  -c:v libx264 \
  -crf 17 \
  -preset slow \
  -an \
  film_master.mp4

echo
echo "[2/4] Building site/media/film.mp4 (1280px wide, CRF 27, keyframe every frame -g 1, +faststart, no audio)..."
"$FFMPEG" -y -i film_master.mp4 \
  -vf "scale=1280:720" \
  -c:v libx264 \
  -crf 27 \
  -preset slow \
  -g 1 \
  -keyint_min 1 \
  -an \
  -movflags +faststart \
  site/media/film.mp4

echo
echo "[3/4] Building site/media/film_mobile.mp4 (854px wide, CRF 28, keyframe every frame -g 1, +faststart, no audio)..."
"$FFMPEG" -y -i film_master.mp4 \
  -vf "scale=854:480" \
  -c:v libx264 \
  -crf 28 \
  -preset slow \
  -g 1 \
  -keyint_min 1 \
  -an \
  -movflags +faststart \
  site/media/film_mobile.mp4

echo
echo "[4/4] Extracting poster frame site/media/poster.jpg (first frame)..."
"$FFMPEG" -y -i film_master.mp4 \
  -vframes 1 \
  -q:v 2 \
  site/media/poster.jpg

echo
echo "==================================================="
echo "Build completed successfully!"
echo "Master: film_master.mp4"
echo "Web:    site/media/film.mp4"
echo "Mobile: site/media/film_mobile.mp4"
echo "Poster: site/media/poster.jpg"
echo "==================================================="
