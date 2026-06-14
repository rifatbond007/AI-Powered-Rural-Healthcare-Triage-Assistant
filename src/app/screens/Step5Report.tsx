import { useState } from "react";
import { Download, Send, Check, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";
import type { Lang, PatientData, Vitals } from "@/app/types";
import { tx } from "@/app/translations";
import { TRIAGE_STYLES, getVitalStatus, VITAL_DOT } from "@/app/utils";
import { MOCK_TRIAGE } from "@/app/mock-data";
import { AudioPlayer } from "@/app/components/shared/AudioPlayer";

interface Props {
  patientData: PatientData;
  vitals: Vitals;
  onRestart: () => void;
  lang: Lang;
}

export function Step5Report({ patientData, vitals, onRestart, lang }: Props) {
  const [sent, setSent] = useState(false);
  const cfg = TRIAGE_STYLES[MOCK_TRIAGE.level];
  const now = new Date();

  const vitalItems = [
    { label: "BP", value: vitals.bp || "—", field: "bp" },
    { label: "HR", value: vitals.hr ? `${vitals.hr} bpm` : "—", field: "hr" },
    { label: "Temp", value: vitals.temp ? `${vitals.temp}°C` : "—", field: "temp" },
    { label: "SpO₂", value: vitals.spo2 ? `${vitals.spo2}%` : "—", field: "spo2" },
    { label: "Glucose", value: vitals.glucose ? `${vitals.glucose} mg/dL` : "—", field: "glucose" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{tx("fullReport", lang)}</h2>
          <Badge
            className="text-xs font-black px-3 py-1.5"
            style={{
              backgroundColor: cfg.hex,
              color: cfg.text === "text-white" ? "white" : "#1f2937",
            }}
          >
            {tx(MOCK_TRIAGE.level, lang)}
          </Badge>
        </div>

        <Card className="overflow-hidden">
          <div className="bg-teal-600 px-5 py-4 text-white">
            <p className="font-bold text-lg">{patientData.name}</p>
            <p className="text-teal-100 text-sm">
              {patientData.age}y · {patientData.gender} · {now.toLocaleDateString()}
            </p>
          </div>
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Vitals</p>
              <div className="grid grid-cols-2 gap-2">
                {vitalItems.map(({ label, value, field }) => {
                  const st = getVitalStatus(field, value.replace(/[^\d./]/g, ""));
                  return (
                    <div key={label} className="bg-muted/50 rounded-xl p-2.5 flex items-center gap-2">
                      <div className={`size-2 rounded-full flex-shrink-0 ${VITAL_DOT[st]}`} />
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-bold text-gray-900 font-mono">{value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Assessment</p>
              <p className="text-sm text-gray-700 leading-relaxed">{MOCK_TRIAGE.reasoning}</p>
            </div>

            <Separator />

            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Differential Diagnoses</p>
              <div className="space-y-1">
                {MOCK_TRIAGE.conditions.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-700">{c.en}</span>
                    <span className={`text-xs font-semibold ml-auto ${c.probability === "High" ? "text-red-600" : "text-amber-600"}`}>
                      {c.probability}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs text-muted-foreground">
                Assessed by: <span className="font-semibold text-gray-600">{tx("chwName", lang)}</span> · {tx("location", lang)}
              </p>
              <p className="text-xs text-muted-foreground">Generated: {now.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <AudioPlayer lang={lang} />
      </div>

      <div className="px-4 pb-4 pt-3 space-y-3 bg-white border-t border-gray-100">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="default" className="bg-blue-600 hover:bg-blue-500 h-12 text-base font-semibold">
            <Download size={18} /> {tx("downloadPDF", lang)}
          </Button>
          <Button
            onClick={() => setSent(true)}
            className={`h-12 text-base font-semibold ${sent ? "bg-green-500 hover:bg-green-500" : "bg-teal-600 hover:bg-teal-500"}`}
          >
            {sent ? <><Check size={18} /> Sent!</> : <><Send size={18} /> {tx("sendDoc", lang)}</>}
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={onRestart}
          className="w-full h-12 text-base font-bold"
        >
          <RefreshCw size={18} /> {tx("newPatient", lang)}
        </Button>
      </div>
    </div>
  );
}
