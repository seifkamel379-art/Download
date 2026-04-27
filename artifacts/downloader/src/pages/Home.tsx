import { useEffect, useMemo, useState } from "react";
import { Download, Link2, Loader2, X, AlertCircle } from "lucide-react";
import { PlatformsStrip } from "@/components/PlatformsStrip";
import { FormatList } from "@/components/FormatList";
import { detectPlatform, platforms } from "@/lib/platforms";
import { fetchInfo, formatDuration, type VideoInfo } from "@/lib/api";

const PAGE_BG =
  "radial-gradient(80% 60% at 20% 0%, rgba(232,210,180,0.55), transparent 60%), radial-gradient(60% 50% at 80% 0%, rgba(212,180,140,0.45), transparent 60%), linear-gradient(180deg, #FBF7F0 0%, #F5EBD9 60%, #EDE0C8 100%)";

const BRAND_GRADIENT = "linear-gradient(135deg, #C9A678 0%, #A88B5E 100%)";
const BRAND_PRIMARY = "#A88B5E";
const TEXT_DARK = "#3D2817";
const TEXT_MUTED = "#6B5440";

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
    document.title = "Download 10 — حمّل أي فيديو من أي رابط";
  }, []);

  return (
    <div
      className="min-h-screen w-full"
      dir="rtl"
      style={{ background: PAGE_BG, color: TEXT_DARK }}
    >
      {/* Top bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-8">
        <div className="flex items-center gap-2">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md"
            style={{ background: BRAND_GRADIENT }}
          >
            <Download size={18} />
          </span>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: TEXT_DARK }}
          >
            Download 10
          </span>
        </div>
        <a
          href="#platforms"
          className="text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: TEXT_MUTED }}
        >
          {platforms.length}+ منصة مدعومة
        </a>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 sm:px-8 pt-2 sm:pt-4 pb-10 text-center">
        <div
          className="mx-auto inline-flex items-center gap-2 rounded-full border bg-white/60 px-3 py-1 text-[11px] font-medium backdrop-blur"
          style={{ borderColor: "#E5D6BD", color: TEXT_MUTED }}
        >
          مجاني · بدون تسجيل · صوت + فيديو
        </div>
        <h1
          className="mt-5 text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.2] tracking-tight"
          style={{ color: TEXT_DARK }}
        >
          حمّل أي فيديو
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #B8956A 0%, #8B6F47 100%)",
            }}
          >
            من أي رابط بكل سهولة
          </span>
        </h1>
        <p
          className="mx-auto mt-4 max-w-xl text-sm sm:text-base"
          style={{ color: TEXT_MUTED }}
        >
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
            className="group flex items-stretch overflow-hidden rounded-2xl border-2 bg-white shadow-xl transition-all"
            style={{
              borderColor: platform ? platform.color : "#D9C5A4",
              boxShadow: platform
                ? `0 16px 40px -20px ${platform.color}55, 0 0 0 4px ${platform.color}18`
                : "0 16px 40px -20px rgba(168,139,94,0.35)",
            }}
          >
            <div
              className="flex items-center pe-2 ps-4"
              style={{ color: TEXT_MUTED }}
            >
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
              className="flex-1 bg-transparent px-3 py-4 text-sm sm:text-base outline-none text-start"
              style={{ color: TEXT_DARK }}
              data-testid="input-url"
            />
            {url && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2 transition-colors hover:opacity-70"
                style={{ color: TEXT_MUTED }}
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
            <div className="mt-3 text-xs" style={{ color: TEXT_MUTED }}>
              مش متعرف على المنصة، بس هنحاول نشغّله بالمستخرج العام.
            </div>
          )}
        </form>

        {error && (
          <div
            className="mx-auto mt-6 flex max-w-2xl items-start gap-3 rounded-xl border px-4 py-3 text-start text-sm"
            style={{
              borderColor: "#E5B89A",
              background: "#FBEFE3",
              color: "#7A3B1F",
            }}
            data-testid="text-error"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="space-y-1 min-w-0">
              <div className="font-semibold">معرفناش نجيب الرابط ده</div>
              <div className="break-words opacity-80" dir="ltr">
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
            className="overflow-hidden rounded-3xl border bg-white text-zinc-900 shadow-xl"
            style={{ borderColor: "#E5D6BD" }}
            data-testid="card-result"
          >
            <div className="flex flex-col md:flex-row">
              <div
                className="md:w-2/5"
                style={{ background: "#F5EBD9" }}
              >
                {info.thumbnail ? (
                  <img
                    src={info.thumbnail}
                    alt={info.title}
                    className="h-56 w-full object-cover md:h-full"
                  />
                ) : (
                  <div
                    className="flex h-56 w-full items-center justify-center md:h-full"
                    style={{ color: TEXT_MUTED }}
                  >
                    لا توجد معاينة
                  </div>
                )}
              </div>
              <div className="flex-1 p-5 sm:p-6">
                <div
                  className="flex flex-wrap items-center gap-2 text-xs font-medium"
                  style={{ color: TEXT_MUTED }}
                >
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
                    <span
                      className="rounded-full px-2 py-0.5"
                      style={{
                        background: "#F5EBD9",
                        color: TEXT_DARK,
                      }}
                    >
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
                  style={{ color: TEXT_DARK }}
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
        className="border-t bg-white/40 backdrop-blur-md"
        style={{ borderColor: "#E5D6BD" }}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-8">
          <div className="mb-4">
            <h2
              className="text-base font-bold"
              style={{ color: TEXT_DARK }}
            >
              المنصات المدعومة
            </h2>
            <p className="text-xs" style={{ color: TEXT_MUTED }}>
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

      <footer
        className="mx-auto max-w-6xl px-4 sm:px-8 py-6 text-center text-xs"
        style={{ color: TEXT_MUTED }}
      >
        استخدم الموقع باحترام لشروط كل منصة.
      </footer>
    </div>
  );
}

void BRAND_PRIMARY;
