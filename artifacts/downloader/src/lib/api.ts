export interface VideoFormat {
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

export interface VideoInfo {
  title: string;
  thumbnail: string | null;
  duration: number | null;
  uploader: string | null;
  webpageUrl: string;
  extractor: string;
  isAudio: boolean;
  availableHeights: number[];
  formats: VideoFormat[];
}

const API_BASE: string = (() => {
  const fromEnv = (import.meta.env.VITE_API_URL ?? "").trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return "";
})();

export function apiUrl(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${API_BASE}${path}`;
}

export async function fetchInfo(url: string): Promise<VideoInfo> {
  const res = await fetch(apiUrl("/api/info"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    let message = "تعذر جلب معلومات الفيديو";
    try {
      const data = await res.json();
      if (typeof data?.error === "string") message = data.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }
  return (await res.json()) as VideoInfo;
}

export function buildDownloadUrl(params: {
  url: string;
  quality?: string;
  audio?: string;
  filename?: string;
}): string {
  const search = new URLSearchParams();
  search.set("url", params.url);
  if (params.quality) search.set("quality", params.quality);
  if (params.audio) search.set("audio", params.audio);
  if (params.filename) search.set("filename", params.filename);
  return apiUrl(`/api/download?${search.toString()}`);
}

export function formatBytes(bytes: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n < 10 ? 1 : 0)} ${units[i]}`;
}

export function formatDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) return "—";
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  return `${m}:${String(ss).padStart(2, "0")}`;
}
