# Dockerfile for Hugging Face Spaces (Docker SDK).
#
# This file lives inside the Hugging Face Space (NOT in this repo).
# When you create your Space you upload only TWO files: this Dockerfile
# and the README.md from this folder.
#
# IMPORTANT: edit the GITHUB_REPO line below to point to YOUR GitHub repo
# (the same one you pushed the project to).

FROM node:20-bookworm-slim

# yt-dlp needs Python; ffmpeg lets it merge separate audio + video streams.
RUN apt-get update && apt-get install -y --no-install-recommends \
        python3 python3-pip ca-certificates curl git ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Hugging Face Spaces run as non-root user "user" (UID 1000).
RUN useradd -m -u 1000 user || true
USER user
ENV HOME=/home/user
WORKDIR /home/user

# >>> EDIT THIS LINE: replace with the URL of your GitHub repo <<<
ARG GITHUB_REPO=https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git

RUN git clone --depth 1 "$GITHUB_REPO" app
WORKDIR /home/user/app

# Install pnpm and the project (yt-dlp binary is downloaded as part of this).
RUN npm install -g pnpm@10
RUN pnpm install --frozen-lockfile=false
RUN pnpm --filter @workspace/api-server run build

# Hugging Face Spaces require the app to listen on port 7860.
ENV PORT=7860
ENV NODE_ENV=production
EXPOSE 7860

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
