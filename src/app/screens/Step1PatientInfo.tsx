import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import type { Lang, PatientData } from "@/app/types";
import { tx } from "@/app/translations";

interface Props {
  data: PatientData;
  onChange: (d: Partial<PatientData>) => void;
  onNext: () => void;
  onBack: () => void;
  lang: Lang;
}

const GENDERS = ["male", "female", "other"] as const;

const SAMPLE_TRANSCRIPTION = {
  en: "Patient complains of headache for 3 days, dizziness when standing, occasional chest tightness, and decreased appetite.",
  bn: "রোগী ৩ দিন ধরে মাথাব্যথা, দাঁড়ালে মাথা ঘোরা, মাঝে মাঝে বুকের চাপ এবং ক্ষুধা কমে যাওয়ার অভিযোগ করছেন।",
};

const SAMPLE_TRANSLATION = "Patient complains of headache for 3 days, dizziness when standing, occasional chest tightness, and decreased appetite.";

export function Step1PatientInfo({ data, onChange, onNext, onBack, lang }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [recTime, setRecTime] = useState(0);
  const [showTranscription, setShowTranscription] = useState(false);

  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setRecTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      onChange({ transcription: SAMPLE_TRANSCRIPTION[lang] });
      setShowTranscription(true);
    } else {
      setRecTime(0);
      setIsRecording(true);
    }
  };

  const canProceed = data.name.trim() && data.age.trim() && data.gender;
  const mins = Math.floor(recTime / 60).toString().padStart(2, "0");
  const secs = (recTime % 60).toString().padStart(2, "0");

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-5">
        <h2 className="text-xl font-bold text-gray-900">{tx("patientIntake", lang)}</h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{tx("patientName", lang)}</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              placeholder={tx("namePh", lang)}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">{tx("age", lang)}</Label>
            <Input
              id="age"
              type="number"
              inputMode="numeric"
              value={data.age}
              onChange={(e) => onChange({ age: e.target.value })}
              placeholder={tx("agePh", lang)}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label>{tx("gender", lang)}</Label>
            <div className="flex gap-2">
              {GENDERS.map((g) => (
                <Button
                  key={g}
                  type="button"
                  variant={data.gender === g ? "default" : "outline"}
                  className={`flex-1 h-12 text-base font-semibold ${data.gender === g ? "bg-teal-600 hover:bg-teal-500" : ""}`}
                  onClick={() => onChange({ gender: g })}
                >
                  {tx(g, lang)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <Card className="border-dashed border-teal-200 bg-teal-50/30">
          <CardContent className="p-6 flex flex-col items-center gap-4">
            <p className="text-sm font-semibold text-gray-600 text-center">{tx("speakSx", lang)}</p>
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {isRecording && (
                  <>
                    <span className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping pointer-events-none" />
                    <span className="absolute inset-[-8px] rounded-full border-2 border-red-300 opacity-40 animate-ping pointer-events-none" style={{ animationDelay: "0.3s" }} />
                  </>
                )}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`size-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 active:scale-95 ${
                    isRecording
                      ? "bg-red-500 text-white hover:bg-red-600 shadow-red-200"
                      : "bg-teal-600 text-white hover:bg-teal-500 shadow-teal-200"
                  }`}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? <MicOff size={36} /> : <Mic size={36} />}
                </button>
              </div>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-red-600 font-mono font-semibold"
                >
                  <span className="size-2 bg-red-500 rounded-full animate-pulse" />
                  {mins}:{secs}
                </motion.div>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {isRecording ? tx("recStop", lang) : tx("tapRecord", lang)}
            </p>
          </CardContent>
        </Card>

        <AnimatePresence>
          {showTranscription && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <Card className="border-teal-200 bg-teal-50/50">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                      {tx("liveXcript", lang)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {tx("detectedLang", lang)} Bengali
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed">{data.transcription}</p>
                </CardContent>
              </Card>
              {lang === "bn" && (
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="p-4">
                    <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">
                      {tx("enTranslation", lang)}
                    </p>
                    <p className="text-sm text-gray-800 leading-relaxed">{SAMPLE_TRANSLATION}</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-3 p-4 bg-white border-t border-gray-100">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 text-base font-semibold">
          {tx("back", lang)}
        </Button>
        <Button onClick={onNext} disabled={!canProceed} className="flex-1 h-12 text-base font-bold bg-teal-600 hover:bg-teal-500">
          {tx("next", lang)}
        </Button>
      </div>
    </div>
  );
}
