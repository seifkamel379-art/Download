import { Download, Music, Video } from "lucide-react";
import { buildDownloadUrl, type VideoInfo } from "@/lib/api";
import type { Platform } from "@/lib/platforms";

interface Props {
  info: VideoInfo;
  url: string;
  platform: Platform | null;
}

const QUALITY_LABEL: Record<string, string> = {
  best: "أفضل جودة متاحة",
  "2160": "4K · 2160p",
  "1440": "2K · 1440p",
  "1080": "Full HD · 1080p",
  "720": "HD · 720p",
  "480": "480p",
  "360": "360p",
  "240": "240p",
  "144": "144p",
};

export function FormatList({ info, url, platform }: Props) {
  const accent = platform?.color ?? "#A0734A";

  const triggerDownload = (params: {
    quality?: string;
    audio?: string;
  }) => {
    const href = buildDownloadUrl({
      url,
      quality: params.quality,
      audio: params.audio,
      filename: info.title,
    });
    const a = document.createElement("a");
    a.href = href;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const heightOptions: string[] = ["best", ...info.availableHeights.map(String)];

  return (
    <div className="space-y-6">
      {!info.isAudio && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: `${accent}20`, color: accent }}
            >
              <Video size={18} />
            </span>
            <h3 className="text-sm font-bold text-zinc-900">
              تحميل الفيديو (مع الصوت)
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {heightOptions.map((q) => (
              <QualityButton
                key={q}
                label={QUALITY_LABEL[q] ?? `${q}p`}
                hint="MP4 · فيديو + صوت"
                accent={accent}
                onClick={() => triggerDownload({ quality: q })}
                icon={<Download size={16} />}
                testId={`video-${q}`}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: `${accent}20`, color: accent }}
          >
            <Music size={18} />
          </span>
          <h3 className="text-sm font-bold text-zinc-900">تحميل الصوت فقط</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <QualityButton
            label="MP3"
            hint="متوافق مع كل الأجهزة"
            accent={accent}
            onClick={() => triggerDownload({ audio: "mp3" })}
            icon={<Music size={16} />}
            testId="audio-mp3"
          />
          <QualityButton
            label="M4A"
            hint="جودة أعلى · حجم أصغر"
            accent={accent}
            onClick={() => triggerDownload({ audio: "m4a" })}
            icon={<Music size={16} />}
            testId="audio-m4a"
          />
        </div>
      </div>
    </div>
  );
}

function QualityButton({
  label,
  hint,
  accent,
  onClick,
  icon,
  testId,
}: {
  label: string;
  hint: string;
  accent: string;
  onClick: () => void;
  icon: React.ReactNode;
  testId: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="group flex items-center justify-between gap-2 rounded-xl border bg-white px-3 py-3 text-start transition-all hover:shadow-md"
      style={{
        borderColor: "#E5DCC9",
        borderInlineStartWidth: "4px",
        borderInlineStartColor: accent,
      }}
    >
      <div className="min-w-0">
        <div className="text-sm font-semibold text-zinc-900 truncate">
          {label}
        </div>
        <div className="text-[11px] text-zinc-500 truncate">{hint}</div>
      </div>
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-transform group-hover:scale-110"
        style={{ background: accent }}
      >
        {icon}
      </span>
    </button>
  );
}
