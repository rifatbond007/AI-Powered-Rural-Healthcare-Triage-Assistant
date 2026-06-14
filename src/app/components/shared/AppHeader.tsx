import { Globe, Stethoscope } from "lucide-react";
import type { Lang } from "@/app/types";
import { tx } from "@/app/translations";

interface Props {
  lang: Lang;
  setLang: (l: Lang) => void;
  onHome?: () => void;
}

export function AppHeader({ lang, setLang, onHome }: Props) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <button onClick={onHome} className="flex items-center gap-2.5 active:opacity-70 transition-opacity">
        <div className="size-9 bg-teal-600 rounded-xl flex items-center justify-center shadow">
          <Stethoscope size={18} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-none">{tx("appName", lang)}</p>
          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{tx("location", lang)}</p>
        </div>
      </button>
      <button
        onClick={() => setLang(lang === "en" ? "bn" : "en")}
        className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-all shadow-sm"
        aria-label="Toggle language"
      >
        <Globe size={14} />
        <span>{lang === "en" ? "বাংলা" : "English"}</span>
      </button>
    </header>
  );
}
