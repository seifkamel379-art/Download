import { platforms, type Platform } from "@/lib/platforms";

interface Props {
  activeId?: string | null;
  onSelect?: (p: Platform) => void;
}

export function PlatformsStrip({ activeId, onSelect }: Props) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {platforms.map((p) => {
          const Icon = p.icon;
          const active = activeId === p.id;
          const bg = p.gradient ?? p.color;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect?.(p)}
              data-testid={`platform-${p.id}`}
              className={`group relative overflow-hidden rounded-2xl px-4 py-4 text-left transition-all duration-200 hover:scale-[1.03] hover:shadow-xl ${
                active
                  ? "ring-4 ring-white/40 scale-[1.03] shadow-2xl"
                  : "shadow-md"
              }`}
              style={{
                background: bg,
                color: p.textColor,
              }}
              title={p.example}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm leading-tight truncate">
                    {p.name}
                  </div>
                  <div
                    className="text-[10px] leading-tight opacity-80 truncate"
                    style={{ color: p.textColor }}
                  >
                    Supported
                  </div>
                </div>
              </div>
              <div
                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background:
                    "radial-gradient(circle at top right, rgba(255,255,255,0.25), transparent 60%)",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
