import { motion } from "motion/react";
import type { Lang } from "@/app/types";
import { tx, STEP_LABELS } from "@/app/translations";

export function StepProgressBar({ step, lang }: { step: number; lang: Lang }) {
  const labels = STEP_LABELS[lang];
  return (
    <div className="bg-white border-b border-gray-100 px-4 pt-3 pb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
          {tx("stepOf", lang)} {step} {tx("of", lang)}
        </span>
        <span className="text-xs text-muted-foreground">{labels[step - 1]}</span>
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-100">
            <motion.div
              className="h-full bg-teal-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: s <= step ? "100%" : "0%" }}
              transition={{ duration: 0.4, delay: s * 0.05 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
