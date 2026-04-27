---
title: GrabIt API
emoji: 📥
colorFrom: purple
colorTo: pink
sdk: docker
app_port: 7860
pinned: false
---

# GrabIt API

Backend service that powers the GrabIt video/audio downloader.
Uses [yt-dlp](https://github.com/yt-dlp/yt-dlp) under the hood.

- `POST /api/info` — returns metadata + available formats for a media URL.
- `GET  /api/download?url=...&formatId=...&audioOnly=...` — streams the file.
- `GET  /api/healthz` — health check.

The frontend lives on Netlify and talks to this service over HTTPS.
