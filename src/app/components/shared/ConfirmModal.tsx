import { motion } from "motion/react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import type { Lang } from "@/app/types";
import { tx } from "@/app/translations";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  lang: Lang;
}

export function ConfirmModal({ onConfirm, onCancel, lang }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl"
      >
        <div className="size-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{tx("confirmTitle", lang)}</h3>
        <p className="text-muted-foreground text-center text-sm mb-6">{tx("confirmBody", lang)}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1 h-12 text-base font-semibold">
            {tx("cancel", lang)}
          </Button>
          <Button onClick={onConfirm} className="flex-1 h-12 text-base font-semibold bg-teal-600 hover:bg-teal-500">
            {tx("confirm", lang)}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
