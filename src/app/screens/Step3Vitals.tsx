import { motion, AnimatePresence } from "motion/react";
import { Activity, Heart, Thermometer, Droplets, Stethoscope, AlertCircle } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import type { Lang, Vitals } from "@/app/types";
import { tx } from "@/app/translations";
import { getVitalStatus, getVitalWarning, VITAL_DOT } from "@/app/utils";

interface Props {
  vitals: Vitals;
  onChange: (v: Partial<Vitals>) => void;
  onNext: () => void;
  onBack: () => void;
  lang: Lang;
}

const FIELDS = [
  { key: "bp" as const,      labelKey: "bp" as const,      phKey: "bpPh" as const,      unit: "mmHg", icon: Activity },
  { key: "hr" as const,      labelKey: "hr" as const,      phKey: "hrPh" as const,       unit: "bpm",  icon: Heart },
  { key: "temp" as const,    labelKey: "temp" as const,    phKey: "tempPh" as const,     unit: "°C",   icon: Thermometer },
  { key: "spo2" as const,    labelKey: "spo2" as const,    phKey: "spo2Ph" as const,     unit: "%",    icon: Droplets },
  { key: "glucose" as const, labelKey: "glucose" as const, phKey: "glucosePh" as const,  unit: "mg/dL", icon: Stethoscope },
];

export function Step3Vitals({ vitals, onChange, onNext, onBack, lang }: Props) {
  const canProceed = Object.values(vitals).some((v) => v.trim());

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-5">
        <h2 className="text-xl font-bold text-gray-900">{tx("vitalsEntry", lang)}</h2>

        <div className="space-y-4">
          {FIELDS.map(({ key, labelKey, phKey, unit, icon: Icon }) => {
            const status = getVitalStatus(key, vitals[key]);
            const warning = getVitalWarning(key, vitals[key], lang);
            const dotColor = VITAL_DOT[status];

            return (
              <div key={key}>
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Icon size={18} className="text-teal-600" />
                      {tx(labelKey, lang)}
                    </Label>
                    <motion.div
                      className={`size-3 rounded-full ${dotColor}`}
                      animate={{ scale: status === "critical" ? [1, 1.3, 1] : 1 }}
                      transition={{ repeat: status === "critical" ? Infinity : 0, duration: 0.8 }}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={vitals[key]}
                      onChange={(e) => onChange({ [key]: e.target.value })}
                      placeholder={tx(phKey, lang)}
                      className="flex-1 h-12 text-lg font-mono"
                    />
                    <span className="text-sm text-muted-foreground font-medium w-14 text-center">{unit}</span>
                  </div>
                </Card>
                <AnimatePresence>
                  {warning && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className={`text-xs font-semibold mt-1.5 ml-2 flex items-center gap-1 ${
                        status === "critical" ? "text-red-600" : "text-amber-600"
                      }`}
                    >
                      <AlertCircle size={12} /> {warning}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 p-4 bg-white border-t border-gray-100">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 text-base font-semibold">
          {tx("back", lang)}
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1 h-12 text-base font-bold bg-teal-600 hover:bg-teal-500"
        >
          {tx("analyzeBtn", lang)}
        </Button>
      </div>
    </div>
  );
}
