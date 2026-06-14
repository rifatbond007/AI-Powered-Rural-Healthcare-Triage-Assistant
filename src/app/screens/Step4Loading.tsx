import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import type { Lang } from "@/app/types";
import { tx } from "@/app/translations";

export function Step4Loading({ lang }: { lang: Lang }) {
  const steps = ["Reviewing symptoms…", "Checking vitals…", "Cross-referencing conditions…"];

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 text-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="size-16 rounded-full border-4 border-teal-200 border-t-teal-600"
      />
      <div>
        <p className="text-xl font-bold text-gray-900 mb-4">{tx("analyzing", lang)}</p>
        <div className="space-y-3">
          {steps.map((s, i) => (
            <motion.div
              key={s}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.6 + 0.3 }}
              className="flex items-center gap-2 text-sm text-muted-foreground justify-center"
            >
              <Loader2 size={13} className="animate-spin text-teal-500" /> {s}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
