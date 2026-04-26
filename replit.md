# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Project: GrabIt — Universal video/audio downloader

- **Frontend artifact**: `artifacts/downloader` (React + Vite + Tailwind v4, wouter)
- **Backend artifact**: `artifacts/api-server` (Express 5, esbuild bundle)
- **Engine**: `youtube-dl-exec` invoking the bundled `yt-dlp` binary directly via `spawn`
- **Endpoints**:
  - `POST /api/info` → metadata + filtered formats
  - `GET  /api/download?url=...&formatId=...&audioOnly=...` → streams the file with proper `Content-Disposition`
- **Supported platforms (12)**: YouTube, TikTok, Facebook, Instagram, X, Vimeo, Twitch, SoundCloud, Reddit, Dailymotion, Pinterest, LinkedIn — each rendered with brand color in the bottom strip.
- **Frontend env**: `VITE_API_URL` (empty in dev → same-origin proxy). In prod set to the Render URL.
- **Deployment**: see `DEPLOY.md` (Arabic) — frontend on Netlify, backend on Render (both free, no card). Files: `render.yaml` at repo root + `artifacts/downloader/netlify.toml`.
- **Note for production builds**: keep `youtube-dl-exec` in `onlyBuiltDependencies` (pnpm-workspace.yaml) so the yt-dlp binary downloads on install. Python 3 must be available (Render preinstalls it).

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
