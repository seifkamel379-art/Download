# Dockerfile for Hugging Face Spaces (Docker SDK).
#
# This file lives inside the Hugging Face Space (NOT in this repo).
# When you create your Space you upload only TWO files: this Dockerfile
# and the README.md from this folder.
#
# IMPORTANT: edit the GITHUB_REPO line below to point to YOUR GitHub repo
# (the same one you pushed the project to).

FROM node:20-bookworm-slim

# yt-dlp needs Python; ffmpeg lets it merge separate audio + video streams
# (which is required for the highest YouTube/TikTok qualities).
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 python3-pip ca-certificates curl git ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp globally so it's always available in PATH at /usr/local/bin/yt-dlp.
# This guarantees the API server can find it even if the bundled binary fails.
RUN pip3 install --break-system-packages --no-cache-dir -U yt-dlp

# Install pnpm globally (as root) before dropping privileges.
RUN npm install -g pnpm@10

# The node:20 base image already ships a `node` user at UID 1000.
# Remove it and create `user` at UID 1000 (Hugging Face Spaces convention).
RUN userdel -r node 2>/dev/null; \
    useradd -m -u 1000 user

USER user
ENV HOME=/home/user
WORKDIR /home/user

# >>> EDIT THIS LINE: replace with the URL of your GitHub repo <<<
ARG GITHUB_REPO=https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git

RUN git clone --depth 1 "$GITHUB_REPO" app
WORKDIR /home/user/app

# Install dependencies (this also downloads the bundled yt-dlp binary) and build.
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @workspace/api-server run build

# Hugging Face Spaces require the app to listen on port 7860.
ENV PORT=7860
ENV NODE_ENV=production
EXPOSE 7860

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
