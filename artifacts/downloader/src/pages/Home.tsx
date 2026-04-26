import { useEffect, useMemo, useState } from "react";
import { Download, Link2, Loader2, Sparkles, X, AlertCircle } from "lucide-react";
import { PlatformsStrip } from "@/components/PlatformsStrip";
import { FormatList } from "@/components/FormatList";
import { detectPlatform, platforms } from "@/lib/platforms";
import { fetchInfo, formatDuration, type VideoInfo } from "@/lib/api";

const HERO_GRADIENT =
  "radial-gradient(80% 60% at 20% 0%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(60% 50% at 80% 0%, rgba(236,72,153,0.18), transparent 60%), linear-gradient(180deg, #0B1020 0%, #0B1020 60%, #0F1633 100%)";

export default function Home() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platform = useMemo(() => detectPlatform(url), [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const data = await fetchInfo(url.trim());
      setInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl("");
    setInfo(null);
    setError(null);
  };

  useEffect(() => {
    document.title = "GrabIt — Download videos from anywhere";
  }, []);

  return (
    <div
      className="min-h-screen w-full text-white"
      style={{ background: HERO_GRADIENT }}
    >
      {/* Top bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg">
            <Download size={18} />
          </span>
          <span className="text-lg font-bold tracking-tight">GrabIt</span>
        </div>
        <a
          href="#platforms"
          className="text-xs font-medium text-white/70 hover:text-white transition-colors"
        >
          {platforms.length}+ platforms supported
        </a>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 sm:px-8 pt-6 pb-12 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
          <Sparkles size={12} />
          Free · No signup · Audio + Video
        </div>
        <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
          Download any video <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-rose-300 bg-clip-text text-transparent">
            from a single link
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-white/65">
          Paste a video or audio URL, pick a quality, and download instantly. Works with the world's biggest platforms.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 w-full max-w-2xl"
          data-testid="form-url"
        >
          <div
            className="group flex items-stretch overflow-hidden rounded-2xl border-2 bg-white/5 backdrop-blur-md shadow-2xl transition-all"
            style={{
              borderColor: platform ? platform.color : "rgba(255,255,255,0.18)",
              boxShadow: platform
                ? `0 20px 60px -20px ${platform.color}80, 0 0 0 4px ${platform.color}20`
                : undefined,
            }}
          >
            <div className="flex items-center pl-4 text-white/50">
              <Link2 size={18} />
            </div>
            <input
              type="url"
              inputMode="url"
              autoComplete="off"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a video or audio link here…"
              className="flex-1 bg-transparent px-3 py-4 text-sm sm:text-base text-white placeholder-white/40 outline-none"
              data-testid="input-url"
            />
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2 text-white/40 hover:text-white"
                aria-label="Clear"
                data-testid="button-clear"
              >
                <X size={18} />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="flex items-center gap-2 px-5 sm:px-6 font-semibold text-sm sm:text-base text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: platform
                  ? platform.gradient ?? platform.color
                  : "linear-gradient(135deg, #6366F1 0%, #EC4899 100%)",
              }}
              data-testid="button-fetch"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span className="hidden sm:inline">Loading…</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>

          {/* Detected platform pill */}
          {platform && (
            <div
              className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: platform.gradient ?? platform.color,
                color: platform.textColor,
              }}
              data-testid="text-platform"
            >
              <platform.icon size={14} />
              {platform.name} link detected
            </div>
          )}
          {!platform && url.trim() && (
            <div className="mt-3 text-xs text-white/50">
              We'll still try to handle this link via our universal extractor.
            </div>
          )}
        </form>

        {error && (
          <div
            className="mx-auto mt-6 flex max-w-2xl items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-left text-sm text-rose-100"
            data-testid="text-error"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="space-y-1">
              <div className="font-semibold">Couldn't fetch this link</div>
              <div className="text-rose-200/80 break-words">{error}</div>
            </div>
          </div>
        )}
      </section>

      {/* Result */}
      {info && (
        <section className="mx-auto max-w-5xl px-4 sm:px-8 pb-16">
          <div
            className="overflow-hidden rounded-3xl border border-white/10 bg-white/95 text-zinc-900 shadow-2xl dark:bg-zinc-950 dark:text-zinc-100"
            data-testid="card-result"
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5 bg-zinc-100 dark:bg-zinc-900">
                {info.thumbnail ? (
                  <img
                    src={info.thumbnail}
                    alt={info.title}
                    className="h-56 w-full object-cover md:h-full"
                  />
                ) : (
                  <div className="flex h-56 w-full items-center justify-center text-zinc-400 md:h-full">
                    No preview
                  </div>
                )}
              </div>
              <div className="flex-1 p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                  {platform && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                      style={{
                        background: platform.gradient ?? platform.color,
                        color: platform.textColor,
                      }}
                    >
                      <platform.icon size={11} />
                      {platform.name}
                    </span>
                  )}
                  {!platform && (
                    <span className="rounded-full bg-zinc-200 px-2 py-0.5 dark:bg-zinc-800">
                      {info.extractor}
                    </span>
                  )}
                  <span>·</span>
                  <span>{formatDuration(info.duration)}</span>
                  {info.uploader && (
                    <>
                      <span>·</span>
                      <span className="truncate">{info.uploader}</span>
                    </>
                  )}
                </div>
                <h2 className="mt-2 text-xl font-bold leading-tight" data-testid="text-title">
                  {info.title}
                </h2>

                <div className="mt-5">
                  <FormatList info={info} url={url.trim()} platform={platform} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Platforms strip */}
      <section
        id="platforms"
        className="border-t border-white/10 bg-black/30 backdrop-blur-md"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-8">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Supported platforms</h2>
              <p className="text-xs text-white/60">
                Tap a tile to see an example link format.
              </p>
            </div>
          </div>
          <PlatformsStrip
            activeId={platform?.id ?? null}
            onSelect={(p) => {
              setUrl(p.example);
              setError(null);
            }}
          />
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 sm:px-8 py-6 text-center text-xs text-white/40">
        Use responsibly · Respect each platform's terms of service.
      </footer>
    </div>
  );
}
