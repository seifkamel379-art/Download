import { Download, Music, Video, FileVideo } from "lucide-react";
import { buildDownloadUrl, formatBytes, type VideoFormat, type VideoInfo } from "@/lib/api";
import type { Platform } from "@/lib/platforms";

interface Props {
  info: VideoInfo;
  url: string;
  platform: Platform | null;
}

export function FormatList({ info, url, platform }: Props) {
  const accent = platform?.color ?? "#6366F1";

  const videoFormats = info.formats
    .filter((f) => f.hasVideo)
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));

  const audioFormats = info.formats
    .filter((f) => f.audioOnly)
    .sort((a, b) => (b.tbr ?? 0) - (a.tbr ?? 0));

  const seenVideoKeys = new Set<string>();
  const dedupedVideo = videoFormats.filter((f) => {
    const key = `${f.height ?? "x"}-${f.ext}-${f.hasAudio ? "a" : "n"}`;
    if (seenVideoKeys.has(key)) return false;
    seenVideoKeys.add(key);
    return true;
  });

  const seenAudioKeys = new Set<string>();
  const dedupedAudio = audioFormats.filter((f) => {
    const key = `${Math.round(f.tbr ?? 0)}-${f.ext}`;
    if (seenAudioKeys.has(key)) return false;
    seenAudioKeys.add(key);
    return true;
  });

  const triggerDownload = (format: VideoFormat, audioOnly: boolean) => {
    const href = buildDownloadUrl({
      url,
      formatId: format.formatId,
      audioOnly,
      filename: info.title,
      ext: format.ext,
    });
    const a = document.createElement("a");
    a.href = href;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6">
      {dedupedVideo.length > 0 && (
        <Section title="Video qualities" icon={<Video size={18} />} accent={accent}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dedupedVideo.map((f) => (
              <FormatRow
                key={f.formatId}
                label={f.qualityLabel}
                badge={f.hasAudio ? null : "Video only"}
                size={formatBytes(f.filesize)}
                accent={accent}
                icon={<FileVideo size={18} />}
                onClick={() => triggerDownload(f, false)}
                testId={`video-${f.formatId}`}
              />
            ))}
          </div>
        </Section>
      )}

      {dedupedAudio.length > 0 && (
        <Section title="Audio only" icon={<Music size={18} />} accent={accent}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dedupedAudio.map((f) => (
              <FormatRow
                key={f.formatId}
                label={f.qualityLabel}
                badge="Audio"
                size={formatBytes(f.filesize)}
                accent={accent}
                icon={<Music size={18} />}
                onClick={() => triggerDownload(f, true)}
                testId={`audio-${f.formatId}`}
              />
            ))}
          </div>
        </Section>
      )}

      {dedupedVideo.length === 0 && dedupedAudio.length === 0 && (
        <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center text-sm text-zinc-500">
          No downloadable formats were found for this link.
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: `${accent}20`, color: accent }}
        >
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function FormatRow({
  label,
  badge,
  size,
  accent,
  icon,
  onClick,
  testId,
}: {
  label: string;
  badge: string | null;
  size: string;
  accent: string;
  icon: React.ReactNode;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="group flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left transition-all hover:border-transparent hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
      style={{ borderLeft: `4px solid ${accent}` }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
          style={{ background: `${accent}15`, color: accent }}
        >
          {icon}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {label}
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <span>{size}</span>
            {badge && (
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                style={{ background: `${accent}20`, color: accent }}
              >
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>
      <span
        className="flex h-9 w-9 items-center justify-center rounded-lg text-white shrink-0 transition-transform group-hover:scale-110"
        style={{ background: accent }}
      >
        <Download size={18} />
      </span>
    </button>
  );
}
