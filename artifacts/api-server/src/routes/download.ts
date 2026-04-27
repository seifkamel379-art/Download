import { Router, type IRouter, type Request, type Response } from "express";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { existsSync, createReadStream, statSync, unlink } from "node:fs";
import { spawn, execSync } from "node:child_process";
import { randomUUID } from "node:crypto";

const router: IRouter = Router();

function resolveYtDlpBinary(): string {
  const candidates: string[] = [];
  const envBin = process.env["YT_DLP_PATH"];
  if (envBin) candidates.push(envBin);

  // Prefer the system-installed yt-dlp first (pip in production / nix in dev) —
  // it gets updated regularly. The bundled binary in youtube-dl-exec is often
  // months out of date, which causes YouTube TLS/extractor errors.
  candidates.push("/usr/local/bin/yt-dlp", "/usr/bin/yt-dlp");

  try {
    const out = execSync("which yt-dlp", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
    if (out) candidates.push(out);
  } catch {
    // ignore
  }

  // Fall back to the bundled binary only as a last resort.
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    candidates.push(
      // From dist/index.mjs (production build)
      path.resolve(here, "../node_modules/youtube-dl-exec/bin/yt-dlp"),
      // From src/routes/download.ts (dev build paths)
      path.resolve(here, "../../node_modules/youtube-dl-exec/bin/yt-dlp"),
      path.resolve(here, "../../../node_modules/youtube-dl-exec/bin/yt-dlp"),
      path.resolve(here, "../../../../node_modules/youtube-dl-exec/bin/yt-dlp"),
    );
  } catch {
    // ignore
  }

  for (const candidate of candidates) {
    if (candidate && existsSync(candidate)) return candidate;
  }

  return "yt-dlp";
}

const ytDlpBinary = resolveYtDlpBinary();
// eslint-disable-next-line no-console
console.log(`[grabit] using yt-dlp at: ${ytDlpBinary}`);

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
  availableHeights: number[];
  formats: InfoFormat[];
}

const COMMON_ARGS: string[] = [
  "--no-warnings",
  "--no-call-home",
  "--no-check-certificates",
  "--no-playlist",
  "--geo-bypass",
  "--retries",
  "5",
  "--fragment-retries",
  "5",
  "--extractor-args",
  "youtube:player_client=web_safari,android,ios,mweb",
  "--user-agent",
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36",
  "--add-header",
  "Accept-Language:en-US,en;q=0.9",
];

function runYtDlpJson(url: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      ytDlpBinary,
      [url, "--dump-single-json", ...COMMON_ARGS],
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
        reject(
          err instanceof Error ? err : new Error("Failed to parse yt-dlp output"),
        );
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
        const ext = String(f["ext"] ?? "");
        if (ext === "mhtml") return false;
        const proto = String(f["protocol"] ?? "");
        if (proto.includes("m3u8") || proto.includes("dash")) return false;
        const acodec = String(f["acodec"] ?? "none");
        const vcodec = String(f["vcodec"] ?? "none");
        const hasAudio = acodec !== "none" && acodec !== "";
        const hasVideo = vcodec !== "none" && vcodec !== "";
        return hasAudio || hasVideo;
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
            ? `${height}p · ${ext}`
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

    // Collect heights from ALL raw formats (including DASH) — yt-dlp can
    // merge separate video+audio DASH streams during download, so we should
    // expose those heights in the UI even though we filter them from `formats`.
    const heightSet = new Set<number>();
    rawFormats.forEach((f) => {
      const ext = String(f["ext"] ?? "");
      if (ext === "mhtml") return;
      const proto = String(f["protocol"] ?? "");
      if (proto.includes("m3u8")) return; // skip HLS live
      const vcodec = String(f["vcodec"] ?? "none");
      const hasVideo = vcodec !== "none" && vcodec !== "";
      if (!hasVideo) return;
      const h = typeof f["height"] === "number" ? (f["height"] as number) : 0;
      if (h > 0) heightSet.add(h);
    });
    const PRESETS = [2160, 1440, 1080, 720, 480, 360, 240, 144];
    const availableHeights = Array.from(heightSet)
      .filter((h) => PRESETS.includes(h))
      .sort((a, b) => b - a);

    const isAudio = availableHeights.length === 0;

    const payload: InfoResponse = {
      title: String(raw["title"] ?? "video"),
      thumbnail:
        typeof raw["thumbnail"] === "string"
          ? (raw["thumbnail"] as string)
          : null,
      duration:
        typeof raw["duration"] === "number" ? (raw["duration"] as number) : null,
      uploader:
        typeof raw["uploader"] === "string"
          ? (raw["uploader"] as string)
          : null,
      webpageUrl: String(raw["webpage_url"] ?? url),
      extractor: String(
        raw["extractor_key"] ?? raw["extractor"] ?? "Generic",
      ),
      isAudio,
      availableHeights,
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
    name
      .replace(/[\\/:*?"<>|\x00-\x1F]/g, "_")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "download"
  );
}

router.get("/download", (req: Request, res: Response) => {
  const url =
    typeof req.query["url"] === "string" ? (req.query["url"] as string) : "";
  const audio =
    typeof req.query["audio"] === "string" ? (req.query["audio"] as string) : "";
  const quality =
    typeof req.query["quality"] === "string"
      ? (req.query["quality"] as string)
      : "best";
  const filename =
    typeof req.query["filename"] === "string"
      ? (req.query["filename"] as string)
      : "video";

  if (!URL_REGEX.test(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const isAudio = audio === "mp3" || audio === "m4a" || audio === "best";
  const ext = isAudio ? (audio === "mp3" ? "mp3" : "m4a") : "mp4";

  const tmpId = randomUUID();
  const tmpTemplate = path.join(os.tmpdir(), `grabit-${tmpId}.%(ext)s`);

  let args: string[];
  if (isAudio) {
    args = [
      url,
      "-f",
      "bestaudio/best",
      "-x",
      "--audio-format",
      audio === "mp3" ? "mp3" : "m4a",
      "--audio-quality",
      "0",
      "-o",
      tmpTemplate,
      ...COMMON_ARGS,
      "--quiet",
      "--print",
      "after_move:filepath",
    ];
  } else {
    let formatSelector: string;
    const h = parseInt(quality, 10);
    if (!Number.isFinite(h) || quality === "best") {
      formatSelector = "bestvideo*+bestaudio/best";
    } else {
      formatSelector = `bestvideo[height<=${h}]+bestaudio/best[height<=${h}]/best`;
    }
    args = [
      url,
      "-f",
      formatSelector,
      "--merge-output-format",
      "mp4",
      "-o",
      tmpTemplate,
      ...COMMON_ARGS,
      "--quiet",
      "--print",
      "after_move:filepath",
    ];
  }

  const safeName = sanitizeFilename(filename);

  const child = spawn(ytDlpBinary, args, { stdio: ["ignore", "pipe", "pipe"] });

  let stdoutBuf = "";
  let stderrBuf = "";
  child.stdout.on("data", (c: Buffer) => {
    stdoutBuf += c.toString("utf8");
  });
  child.stderr.on("data", (c: Buffer) => {
    stderrBuf += c.toString("utf8");
  });

  let aborted = false;
  req.on("close", () => {
    if (!child.killed) {
      aborted = true;
      child.kill("SIGKILL");
    }
  });

  child.on("error", (err) => {
    req.log.error({ err }, "yt-dlp spawn failed");
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: `Failed to start downloader: ${err.message}` });
    }
  });

  child.on("close", (code) => {
    if (aborted) return;
    if (code !== 0) {
      req.log.error(
        { code, stderr: stderrBuf.slice(0, 500) },
        "yt-dlp exited non-zero",
      );
      if (!res.headersSent) {
        const errLine =
          stderrBuf.split("\n").filter(Boolean).pop() ??
          `yt-dlp exited with code ${code}`;
        res.status(500).json({ error: errLine });
      }
      return;
    }
    const actualPath = stdoutBuf.trim().split("\n").filter(Boolean).pop();
    if (!actualPath || !existsSync(actualPath)) {
      req.log.error({ stdoutBuf }, "yt-dlp output file not found");
      if (!res.headersSent) {
        res.status(500).json({ error: "Output file not found" });
      }
      return;
    }

    try {
      const stat = statSync(actualPath);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${safeName}.${ext}"; filename*=UTF-8''${encodeURIComponent(safeName)}.${ext}`,
      );
      res.setHeader(
        "Content-Type",
        ext === "mp3"
          ? "audio/mpeg"
          : ext === "m4a"
            ? "audio/mp4"
            : "video/mp4",
      );
      res.setHeader("Content-Length", String(stat.size));
      res.setHeader("Cache-Control", "no-store");

      const stream = createReadStream(actualPath);
      const cleanup = () => {
        unlink(actualPath, () => {
          /* ignore */
        });
      };
      stream.pipe(res);
      stream.on("end", cleanup);
      stream.on("error", cleanup);
      res.on("close", cleanup);
    } catch (err) {
      req.log.error({ err }, "stream error");
      if (!res.headersSent) {
        res.status(500).json({ error: "Stream error" });
      }
    }
  });

  return undefined;
});

export default router;
