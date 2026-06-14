import { useState, useEffect, useRef } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import type { Lang } from "@/app/types";
import { tx } from "@/app/translations";

export function AudioPlayer({ lang }: { lang: Lang }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) { setPlaying(false); return 0; }
          return p + 1;
        });
      }, 180);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing]);

  return (
    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="size-12 bg-teal-600 text-white rounded-full flex items-center justify-center shadow hover:bg-teal-500 active:scale-95 transition-all"
        >
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-teal-800 mb-1">{tx("listenSummary", lang)}</p>
          <p className="text-xs text-teal-600">{playing ? tx("playing", lang) : tx("paused", lang)}</p>
        </div>
        <Volume2 size={20} className="text-teal-500" />
      </div>
      <div className="h-2 bg-teal-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-teal-600 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
