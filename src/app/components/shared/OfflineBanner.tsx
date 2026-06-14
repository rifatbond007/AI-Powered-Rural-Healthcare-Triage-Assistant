import { motion } from "motion/react";
import { WifiOff } from "lucide-react";
import type { Lang } from "@/app/types";
import { tx } from "@/app/translations";

export function OfflineBanner({ lang }: { lang: Lang }) {
  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center gap-2 bg-amber-500 text-white px-4 py-2 text-sm font-medium"
    >
      <WifiOff size={16} />
      <span>{tx("offline", lang)}</span>
      <span className="opacity-75">— {tx("offlineSub", lang)}</span>
    </motion.div>
  );
}
