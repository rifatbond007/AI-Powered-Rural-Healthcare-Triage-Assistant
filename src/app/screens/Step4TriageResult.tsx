import { useState } from "react";
import { motion } from "motion/react";
import { FileText, Stethoscope, CheckCircle, Phone, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import type { Lang, PatientData, TriageConfig } from "@/app/types";
import { tx } from "@/app/translations";
import { TRIAGE_STYLES } from "@/app/utils";
import { AudioPlayer } from "@/app/components/shared/AudioPlayer";

interface Props {
  patientData: PatientData;
  triageResult: TriageConfig;
  audioUrl: string | null;
  onNext: () => void;
  onBack: () => void;
  lang: Lang;
}

export function Step4TriageResult({ patientData, triageResult, audioUrl, onNext, onBack, lang }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const t = triageResult;
  const cfg = TRIAGE_STYLES[t.level];

  const toggleCheck = (i: number) => setChecked((prev) => {
    const s = new Set(prev);
    s.has(i) ? s.delete(i) : s.add(i);
    return s;
  });

  return (
    <div className="flex flex-col h-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${cfg.bg} ${cfg.text} px-5 py-5`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold opacity-80 uppercase tracking-wider mb-0.5">
              {tx("triageResult", lang)}
            </p>
            <p className="text-4xl font-black tracking-tight">
              {tx(t.level, lang)}
            </p>
            <p className="text-sm opacity-90 mt-1">{patientData.name} · {patientData.age}y</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-70 uppercase">{tx("riskScore", lang)}</p>
            <p className="text-5xl font-black">{t.score}</p>
            <p className="text-xs opacity-70">/100</p>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <FileText size={15} className="text-teal-600" /> {tx("clinReasoning", lang)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed">
              {lang === "bn" ? t.reasoningbn : t.reasoning}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <Stethoscope size={15} className="text-teal-600" /> {tx("conditions", lang)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {t.conditions.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="size-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {lang === "bn" ? c.bn : c.en}
                  </span>
                </div>
                <Badge variant={c.probability === "High" ? "destructive" : "secondary"} className="text-xs">
                  {c.probability}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <CheckCircle size={15} className="text-teal-600" /> {tx("firstAid", lang)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {t.firstAid.map((step, i) => (
              <button
                key={i}
                onClick={() => toggleCheck(i)}
                className={`w-full text-left flex items-start gap-3 p-3 rounded-xl transition-all ${
                  checked.has(i) ? "bg-green-50 border border-green-200" : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <div className={`size-6 rounded-lg border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                  checked.has(i) ? "bg-green-500 border-green-500" : "border-gray-300"
                }`}>
                  {checked.has(i) && <Check size={13} className="text-white" />}
                </div>
                <span className={`text-sm leading-snug ${checked.has(i) ? "text-green-800 line-through opacity-70" : "text-gray-700"}`}>
                  {lang === "bn" ? step.bn : step.en}
                </span>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Phone size={16} className="text-red-600" />
              <h3 className="text-sm font-bold text-red-700 uppercase tracking-wider">{tx("referral", lang)}</h3>
              <Badge variant="destructive" className="ml-auto">URGENT</Badge>
            </div>
            <p className="text-sm text-red-800 font-medium leading-snug">
              {lang === "bn" ? t.referral.bn : t.referral.en}
            </p>
          </CardContent>
        </Card>

        <AudioPlayer audioUrl={audioUrl} lang={lang} />
      </div>

      <div className="flex gap-3 p-4 bg-white border-t border-gray-100">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 text-base font-semibold">
          {tx("back", lang)}
        </Button>
        <Button onClick={onNext} className="flex-1 h-12 text-base font-bold bg-teal-600 hover:bg-teal-500">
          {tx("next", lang)}
        </Button>
      </div>
    </div>
  );
}
