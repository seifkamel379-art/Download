import { Router, type IRouter, type Request, type Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";

const router: IRouter = Router();

function resolveYtDlpBinary(): string {
  const candidates: string[] = [];
  const envBin = process.env["YT_DLP_PATH"];
  if (envBin) candidates.push(envBin);

  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    candidates.push(
      path.resolve(here, "../../node_modules/youtube-dl-exec/bin/yt-dlp"),
    );
    candidates.push(
      path.resolve(here, "../../../node_modules/youtube-dl-exec/bin/yt-dlp"),
    );
    candidates.push(
      path.resolve(
        here,
        "../../../../node_modules/youtube-dl-exec/bin/yt-dlp",
      ),
    );
  } catch {
    // ignore
  }

  // pnpm hoisted location
  candidates.push(
    "/home/runner/workspace/node_modules/.pnpm/youtube-dl-exec@3.1.5/node_modules/youtube-dl-exec/bin/yt-dlp",
  );

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) return candidate;
  }
  return "yt-dlp";
}

const ytDlpBinary = resolveYtDlpBinary();

const URL_REGEX = /^https?:\/\/.+/i;

interface InfoFormat {
  formatId: string;
  ext: string;
  qualityLabel: string;
  height: number | null;
  fps: number | null;
  filesize: number | null;
  hasAudio: boolean;
  hasVideo: boolean;
  audioOnly: boolean;
  videoOnly: boolean;
  tbr: number | null;
}

interface InfoResponse {
  title: string;
  thumbnail: string | null;
  duration: number | null;
  uploader: string | null;
  webpageUrl: string;
  extractor: string;
  isAudio: boolean;
  formats: InfoFormat[];
}

function runYtDlpJson(url: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      ytDlpBinary,
      [
        url,
        "--dump-single-json",
        "--no-warnings",
        "--no-call-home",
        "--no-check-certificates",
        "--no-playlist",
        "--prefer-free-formats",
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on("data", (c: Buffer) => stdoutChunks.push(c));
    child.stderr.on("data", (c: Buffer) => stderrChunks.push(c));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        const msg = Buffer.concat(stderrChunks)
          .toString("utf8")
          .split("\n")
          .filter(Boolean)
          .pop();
        reject(new Error(msg ?? `yt-dlp exited with code ${code}`));
        return;
      }
      try {
        const json = JSON.parse(Buffer.concat(stdoutChunks).toString("utf8"));
        resolve(json);
      } catch (err) {
        reject(err instanceof Error ? err : new Error("Failed to parse yt-dlp output"));
      }
    });
  });
}

router.post("/info", async (req: Request, res: Response) => {
  const url: unknown = req.body?.url;
  if (typeof url !== "string" || !URL_REGEX.test(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const raw = await runYtDlpJson(url);
    const rawFormats =
      (raw["formats"] as unknown as Array<Record<string, unknown>>) || [];

    const formats: InfoFormat[] = rawFormats
      .filter((f) => {
        const proto = String(f["protocol"] ?? "");
        if (proto.includes("m3u8") || proto.includes("dash")) return false;
        const ext = String(f["ext"] ?? "");
        if (ext === "mhtml") return false;
        const acodec = String(f["acodec"] ?? "none");
        const vcodec = String(f["vcodec"] ?? "none");
        const hasAudio = acodec !== "none" && acodec !== "";
        const hasVideo = vcodec !== "none" && vcodec !== "";
        if (!hasAudio && !hasVideo) return false;
        return true;
      })
      .map((f) => {
        const acodec = String(f["acodec"] ?? "none");
        const vcodec = String(f["vcodec"] ?? "none");
        const hasAudio = acodec !== "none" && acodec !== "";
        const hasVideo = vcodec !== "none" && vcodec !== "";
        const height =
          typeof f["height"] === "number" ? (f["height"] as number) : null;
        const ext = String(f["ext"] ?? "mp4");
        const fps =
          typeof f["fps"] === "number" ? (f["fps"] as number) : null;
        const filesize =
          typeof f["filesize"] === "number"
            ? (f["filesize"] as number)
            : typeof f["filesize_approx"] === "number"
              ? (f["filesize_approx"] as number)
              : null;
        const tbr =
          typeof f["tbr"] === "number" ? (f["tbr"] as number) : null;
        const audioOnly = hasAudio && !hasVideo;
        const videoOnly = hasVideo && !hasAudio;
        const qualityLabel = audioOnly
          ? `Audio · ${Math.round(tbr ?? 0)} kbps · ${ext}`
          : height
            ? `${height}p${fps && fps > 30 ? fps : ""} · ${ext}${videoOnly ? " (no audio)" : ""}`
            : String(f["format_note"] ?? f["format_id"] ?? "unknown");

        return {
          formatId: String(f["format_id"] ?? ""),
          ext,
          qualityLabel,
          height,
          fps,
          filesize,
          hasAudio,
          hasVideo,
          audioOnly,
          videoOnly,
          tbr,
        };
      });

    const isAudio =
      formats.length > 0 && formats.every((f) => f.audioOnly);

    const payload: InfoResponse = {
      title: String(raw["title"] ?? "video"),
      thumbnail:
        typeof raw["thumbnail"] === "string" ? (raw["thumbnail"] as string) : null,
      duration:
        typeof raw["duration"] === "number" ? (raw["duration"] as number) : null,
      uploader:
        typeof raw["uploader"] === "string" ? (raw["uploader"] as string) : null,
      webpageUrl: String(raw["webpage_url"] ?? url),
      extractor: String(raw["extractor_key"] ?? raw["extractor"] ?? "Generic"),
      isAudio,
      formats,
    };
    return res.json(payload);
  } catch (err) {
    req.log.error({ err }, "info failed");
    const message = err instanceof Error ? err.message : "Failed to fetch info";
    return res.status(500).json({ error: message });
  }
});

function sanitizeFilename(name: string): string {
  return (
    name.replace(/[\\/:*?"<>|\x00-\x1F]/g, "_").slice(0, 150) || "download"
  );
}

router.get("/download", (req: Request, res: Response) => {
  const url =
    typeof req.query["url"] === "string" ? (req.query["url"] as string) : "";
  const formatId =
    typeof req.query["format"] === "string"
      ? (req.query["format"] as string)
      : "";
  const audioOnly =
    req.query["audio"] === "1" || req.query["audio"] === "true";
  const filename =
    typeof req.query["filename"] === "string"
      ? (req.query["filename"] as string)
      : "video";
  const ext =
    typeof req.query["ext"] === "string"
      ? (req.query["ext"] as string)
      : audioOnly
        ? "m4a"
        : "mp4";

  if (!URL_REGEX.test(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const formatSelector = formatId
    ? formatId
    : audioOnly
      ? "bestaudio/best"
      : "best[ext=mp4]/best";

  const safeName = sanitizeFilename(filename);
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${safeName}.${ext}"`,
  );
  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");

  const args = [
    url,
    "-f",
    formatSelector,
    "-o",
    "-",
    "--no-warnings",
    "--no-call-home",
    "--no-check-certificates",
    "--no-playlist",
    "--quiet",
  ];

  const child = spawn(ytDlpBinary, args, {
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stderrBuf = "";
  child.stderr.on("data", (chunk: Buffer) => {
    stderrBuf += chunk.toString("utf8");
  });

  child.on("error", (err) => {
    req.log.error({ err }, "yt-dlp spawn failed");
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to start downloader" });
    } else {
      res.end();
    }
  });

  child.stdout.pipe(res);

  child.on("close", (code) => {
    if (code !== 0) {
      req.log.error(
        { code, stderr: stderrBuf.slice(0, 500) },
        "yt-dlp exited non-zero",
      );
    }
    if (!res.writableEnded) res.end();
  });

  req.on("close", () => {
    if (!child.killed) child.kill("SIGKILL");
  });

  return undefined;
});

export default router;
