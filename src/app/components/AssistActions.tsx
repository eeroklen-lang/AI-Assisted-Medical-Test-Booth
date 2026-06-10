import { Headphones, LifeBuoy } from 'lucide-react';

export function AssistActions() {
  return (
    <div className="absolute right-8 top-8 rounded-[1.5rem] border border-white/15 bg-slate-950/30 p-2.5 backdrop-blur-md">
      <div className="mb-2 px-2">
        <p className="text-[11px] uppercase tracking-[0.28em] text-white/50">Support</p>
      </div>
      <div className="flex gap-3">
      <button
        type="button"
        className="rounded-full border border-cyan-200/20 bg-cyan-300/12 px-4 py-3 text-white/90 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition hover:border-cyan-100/40 hover:bg-cyan-300/18"
      >
        <span className="flex items-center gap-3 text-base">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-200/20">
            <Headphones className="h-4 w-4" />
          </span>
          Voice Guidance
        </span>
      </button>
      <button
        type="button"
        className="rounded-full border border-amber-200/20 bg-amber-300/12 px-4 py-3 text-white/90 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] transition hover:border-amber-100/40 hover:bg-amber-300/18"
      >
        <span className="flex items-center gap-3 text-base">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200/20">
            <LifeBuoy className="h-4 w-4" />
          </span>
          Call for Help
        </span>
      </button>
      </div>
    </div>
  );
}
