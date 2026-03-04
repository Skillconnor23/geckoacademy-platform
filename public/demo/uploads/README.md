# Demo upload placeholders

These files are referenced by demo homework submissions. Placeholders are pre-seeded:

- `sample1.png` – Minimal 1x1 transparent PNG for image uploads
- `sample-audio.m4a` – Create a minimal audio placeholder with:
  ```bash
  ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 0.5 -q:a 9 -acodec aac sample-audio.m4a
  ```
  Or leave absent; the app will show the URL even if the file is missing.
