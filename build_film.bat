@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Continuous Film Assembly ^& Web Optimization Builder
echo ===================================================

:: 1. Locate FFmpeg
set "FFMPEG=ffmpeg"
where ffmpeg >nul 2>&1
if %ERRORLEVEL% equ 0 (
    goto :ffmpeg_found
)

echo [INFO] ffmpeg not found directly in PATH, searching WinGet packages...
for /d %%D in ("%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg_*") do (
    for /d %%B in ("%%D\ffmpeg-*") do (
        if exist "%%B\bin\ffmpeg.exe" (
            set "FFMPEG=%%B\bin\ffmpeg.exe"
            goto :ffmpeg_found
        )
    )
)

if exist "%LOCALAPPDATA%\Microsoft\WinGet\Links\ffmpeg.exe" (
    set "FFMPEG=%LOCALAPPDATA%\Microsoft\WinGet\Links\ffmpeg.exe"
    goto :ffmpeg_found
)

echo [ERROR] FFmpeg is not installed or could not be found!
echo Run: winget install Gyan.FFmpeg
exit /b 1

:ffmpeg_found
echo [INFO] Using FFmpeg: "!FFMPEG!"

:: 2. Ensure destination directories exist
if not exist "site\media" mkdir "site\media"

:: 3. Check for clip files (clips/clip1.mp4 ... clips/clip6.mp4)
if not exist "clips\clip1.mp4" (
    echo [INFO] Setting up clips directory from source files...
    if not exist "clips" mkdir "clips"
    if exist "Clips\Man_turns_and_smiles_8f1ac229_1080p.mp4" copy /y "Clips\Man_turns_and_smiles_8f1ac229_1080p.mp4" "clips\clip1.mp4" >nul
    if exist "Clips\Person_stepping_toward_camera_5af44f70_1080p.mp4" copy /y "Clips\Person_stepping_toward_camera_5af44f70_1080p.mp4" "clips\clip2.mp4" >nul
    if exist "Clips\Person_sitting_on_chair_32862b03_1080p.mp4" copy /y "Clips\Person_sitting_on_chair_32862b03_1080p.mp4" "clips\clip3.mp4" >nul
    if exist "Clips\Man_stands_up_and_smiles_ac9b38ec_1080p.mp4" copy /y "Clips\Man_stands_up_and_smiles_ac9b38ec_1080p.mp4" "clips\clip4.mp4" >nul
    if exist "Clips\2nd_last_9bb2955b_t0-8.mp4" copy /y "Clips\2nd_last_9bb2955b_t0-8.mp4" "clips\clip5.mp4" >nul
    if exist "Clips\Man_pulling_screen_and_waving_5023da03_1080p.mp4" copy /y "Clips\Man_pulling_screen_and_waving_5023da03_1080p.mp4" "clips\clip6.mp4" >nul
)

for %%i in (1 2 3 4 5 6) do (
    if not exist "clips\clip%%i.mp4" (
        echo [ERROR] Missing clips\clip%%i.mp4!
        exit /b 1
    )
)

echo.
echo [1/4] Building film_master.mp4 (CRF 17, no audio, delogo, colorlevels, 0.25s xfades)...
echo Watermark: Veo primary star at x=1805, y=960, w=85, h=80; inner star at x=1700, y=860, w=80, h=80

set "FILTER=[0:v]scale=1920:1080:flags=bicubic,setsar=1,fps=24,delogo=x=1805:y=960:w=85:h=80,delogo=x=1700:y=860:w=80:h=80[v0];"
set "FILTER=!FILTER![1:v]scale=1920:1080:flags=bicubic,setsar=1,fps=24,delogo=x=1805:y=960:w=85:h=80,delogo=x=1700:y=860:w=80:h=80[v1];"
set "FILTER=!FILTER![2:v]scale=1920:1080:flags=bicubic,setsar=1,fps=24,delogo=x=1805:y=960:w=85:h=80,delogo=x=1700:y=860:w=80:h=80[v2];"
set "FILTER=!FILTER![3:v]scale=1920:1080:flags=bicubic,setsar=1,fps=24,delogo=x=1805:y=960:w=85:h=80,delogo=x=1700:y=860:w=80:h=80[v3];"
set "FILTER=!FILTER![4:v]scale=1920:1080:flags=bicubic,setsar=1,fps=24,delogo=x=1805:y=960:w=85:h=80,delogo=x=1700:y=860:w=80:h=80[v4];"
set "FILTER=!FILTER![5:v]scale=1920:1080:flags=bicubic,setsar=1,fps=24,delogo=x=1805:y=960:w=85:h=80,delogo=x=1700:y=860:w=80:h=80[v5];"
set "FILTER=!FILTER![v0][v1]xfade=transition=fade:duration=0.25:offset=7.666667[x1];"
set "FILTER=!FILTER![x1][v2]xfade=transition=fade:duration=0.25:offset=15.333333[x2];"
set "FILTER=!FILTER![x2][v3]xfade=transition=fade:duration=0.25:offset=23.000000[x3];"
set "FILTER=!FILTER![x3][v4]xfade=transition=fade:duration=0.25:offset=30.666667[x4];"
set "FILTER=!FILTER![x4][v5]xfade=transition=fade:duration=0.25:offset=38.416667,colorlevels=rimin=0.045:gimin=0.045:bimin=0.045,format=yuv420p[vout]"

"!FFMPEG!" -y ^
  -i clips\clip1.mp4 ^
  -i clips\clip2.mp4 ^
  -i clips\clip3.mp4 ^
  -i clips\clip4.mp4 ^
  -i clips\clip5.mp4 ^
  -i clips\clip6.mp4 ^
  -filter_complex "!FILTER!" ^
  -map "[vout]" ^
  -c:v libx264 ^
  -crf 17 ^
  -preset slow ^
  -an ^
  film_master.mp4

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to generate film_master.mp4!
    exit /b 1
)

echo.
echo [2/4] Building site/media/film.mp4 (1280px wide, CRF 27, keyframe every frame -g 1, +faststart, no audio)...
"!FFMPEG!" -y -i film_master.mp4 ^
  -vf "scale=1280:720" ^
  -c:v libx264 ^
  -crf 27 ^
  -preset slow ^
  -g 1 ^
  -keyint_min 1 ^
  -an ^
  -movflags +faststart ^
  site\media\film.mp4

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to generate site/media/film.mp4!
    exit /b 1
)

echo.
echo [3/4] Building site/media/film_mobile.mp4 (854px wide, CRF 28, keyframe every frame -g 1, +faststart, no audio)...
"!FFMPEG!" -y -i film_master.mp4 ^
  -vf "scale=854:480" ^
  -c:v libx264 ^
  -crf 28 ^
  -preset slow ^
  -g 1 ^
  -keyint_min 1 ^
  -an ^
  -movflags +faststart ^
  site\media\film_mobile.mp4

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to generate site/media/film_mobile.mp4!
    exit /b 1
)

echo.
echo [4/4] Extracting poster frame site/media/poster.jpg (first frame)...
"!FFMPEG!" -y -i film_master.mp4 ^
  -vframes 1 ^
  -q:v 2 ^
  site\media\poster.jpg

if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to extract poster image!
    exit /b 1
)

echo.
echo ===================================================
echo Build completed successfully!
echo Master: film_master.mp4
echo Web:    site/media/film.mp4
echo Mobile: site/media/film_mobile.mp4
echo Poster: site/media/poster.jpg
echo ===================================================
