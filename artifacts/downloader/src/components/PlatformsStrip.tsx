import { platforms, type Platform } from "@/lib/platforms";

interface Props {
  activeId?: string | null;
  onSelect?: (p: Platform) => void;
}

export function PlatformsStrip({ activeId, onSelect }: Props) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
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
              className={`group relative overflow-hidden rounded-2xl px-3 py-3 sm:px-4 sm:py-4 text-start transition-all duration-200 hover:scale-[1.03] hover:shadow-xl ${
                active
                  ? "ring-4 ring-amber-100/50 scale-[1.03] shadow-2xl"
                  : "shadow-md"
              }`}
              style={{
                background: bg,
                color: p.textColor,
              }}
              title={p.example}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.18)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-xs sm:text-sm leading-tight truncate">
                    {p.name}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
