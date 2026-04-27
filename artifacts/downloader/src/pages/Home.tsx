import { useEffect, useMemo, useState } from "react";
import { Download, Link2, Loader2, X, AlertCircle } from "lucide-react";
import { PlatformsStrip } from "@/components/PlatformsStrip";
import { FormatList } from "@/components/FormatList";
import { detectPlatform, platforms } from "@/lib/platforms";
import { fetchInfo, formatDuration, type VideoInfo } from "@/lib/api";

const HERO_GRADIENT =
  "radial-gradient(80% 60% at 20% 0%, rgba(212,165,116,0.20), transparent 60%), radial-gradient(60% 50% at 80% 0%, rgba(184,115,51,0.18), transparent 60%), linear-gradient(180deg, #1F1410 0%, #2A1810 60%, #3A2418 100%)";

const BRAND_GRADIENT = "linear-gradient(135deg, #B87333 0%, #6F4E37 100%)";

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
      setError(err instanceof Error ? err.message : "حصل خطأ غير متوقع");
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
    document.title = "GrabIt — حمّل أي فيديو من أي رابط";
  }, []);

  return (
    <div
      className="min-h-screen w-full text-amber-50"
      dir="rtl"
      style={{ background: HERO_GRADIENT }}
    >
      {/* Top bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl shadow-lg"
            style={{ background: BRAND_GRADIENT }}
          >
            <Download size={18} />
          </span>
          <span className="text-lg font-bold tracking-tight">GrabIt</span>
        </div>
        <a
          href="#platforms"
          className="text-xs font-medium text-amber-100/70 hover:text-amber-50 transition-colors"
        >
          {platforms.length}+ منصة مدعومة
        </a>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 sm:px-8 pt-2 sm:pt-4 pb-10 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-amber-100/15 bg-amber-50/5 px-3 py-1 text-[11px] font-medium text-amber-50/80 backdrop-blur">
          مجاني · بدون تسجيل · صوت + فيديو
        </div>
        <h1 className="mt-5 text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.2] tracking-tight">
          حمّل أي فيديو
          <br />
          <span className="bg-gradient-to-r from-amber-200 via-orange-200 to-amber-100 bg-clip-text text-transparent">
            من أي رابط بكل سهولة
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-amber-50/70">
          الصق رابط الفيديو أو الصوت، اختار الجودة، وحمّل في ثواني. بيدعم أكبر
          منصات في العالم.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-7 w-full max-w-2xl"
          data-testid="form-url"
        >
          <div
            className="group flex items-stretch overflow-hidden rounded-2xl border-2 bg-amber-50/5 backdrop-blur-md shadow-2xl transition-all"
            style={{
              borderColor: platform ? platform.color : "rgba(212,165,116,0.35)",
              boxShadow: platform
                ? `0 20px 60px -20px ${platform.color}80, 0 0 0 4px ${platform.color}20`
                : "0 20px 60px -25px rgba(184,115,51,0.5)",
            }}
          >
            <div className="flex items-center pe-2 ps-4 text-amber-100/50">
              <Link2 size={18} />
            </div>
            <input
              type="url"
              inputMode="url"
              autoComplete="off"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="الصق الرابط هنا…"
              dir="ltr"
              className="flex-1 bg-transparent px-3 py-4 text-sm sm:text-base text-amber-50 placeholder-amber-100/40 outline-none text-start"
              data-testid="input-url"
            />
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2 text-amber-100/40 hover:text-amber-50"
                aria-label="مسح"
                data-testid="button-clear"
              >
                <X size={18} />
              </button>
            )}
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="flex items-center gap-2 px-4 sm:px-6 font-semibold text-sm sm:text-base text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: platform
                  ? platform.gradient ?? platform.color
                  : BRAND_GRADIENT,
              }}
              data-testid="button-fetch"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span className="hidden sm:inline">جاري الجلب…</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>حمّل</span>
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
              تم اكتشاف رابط {platform.name}
            </div>
          )}
          {!platform && url.trim() && (
            <div className="mt-3 text-xs text-amber-100/50">
              مش متعرف على المنصة، بس هنحاول نشغّله بالمستخرج العام.
            </div>
          )}
        </form>

        {error && (
          <div
            className="mx-auto mt-6 flex max-w-2xl items-start gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-start text-sm text-rose-100"
            data-testid="text-error"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="space-y-1 min-w-0">
              <div className="font-semibold">معرفناش نجيب الرابط ده</div>
              <div className="text-rose-200/80 break-words" dir="ltr">
                {error}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Result */}
      {info && (
        <section className="mx-auto max-w-5xl px-4 sm:px-8 pb-16">
          <div
            className="overflow-hidden rounded-3xl border border-amber-200/20 bg-amber-50/95 text-zinc-900 shadow-2xl"
            data-testid="card-result"
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5 bg-amber-100">
                {info.thumbnail ? (
                  <img
                    src={info.thumbnail}
                    alt={info.title}
                    className="h-56 w-full object-cover md:h-full"
                  />
                ) : (
                  <div className="flex h-56 w-full items-center justify-center text-amber-700/60 md:h-full">
                    لا توجد معاينة
                  </div>
                )}
              </div>
              <div className="flex-1 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500">
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
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900">
                      {info.extractor}
                    </span>
                  )}
                  <span>·</span>
                  <span>{formatDuration(info.duration)}</span>
                  {info.uploader && (
                    <>
                      <span>·</span>
                      <span className="truncate" dir="ltr">
                        {info.uploader}
                      </span>
                    </>
                  )}
                </div>
                <h2
                  className="mt-2 text-lg sm:text-xl font-bold leading-tight"
                  dir="auto"
                  data-testid="text-title"
                >
                  {info.title}
                </h2>

                <div className="mt-5">
                  <FormatList
                    info={info}
                    url={url.trim()}
                    platform={platform}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Platforms strip */}
      <section
        id="platforms"
        className="border-t border-amber-100/10 bg-black/30 backdrop-blur-md"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-8">
          <div className="mb-4">
            <h2 className="text-base font-bold text-amber-50">
              المنصات المدعومة
            </h2>
            <p className="text-xs text-amber-50/60">
              دوس على أي منصة عشان تشوف شكل الرابط.
            </p>
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

      <footer className="mx-auto max-w-6xl px-4 sm:px-8 py-6 text-center text-xs text-amber-50/40">
        استخدم الموقع باحترام لشروط كل منصة.
      </footer>
    </div>
  );
}
