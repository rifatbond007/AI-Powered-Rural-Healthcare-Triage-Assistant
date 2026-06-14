import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Lang, Screen, PatientData, Vitals } from "@/app/types";
import { tx } from "@/app/translations";
import { AppHeader } from "@/app/components/shared/AppHeader";
import { OfflineBanner } from "@/app/components/shared/OfflineBanner";
import { StepProgressBar } from "@/app/components/shared/StepProgressBar";
import { ConfirmModal } from "@/app/components/shared/ConfirmModal";
import { Dashboard } from "@/app/screens/Dashboard";
import { Step1PatientInfo } from "@/app/screens/Step1PatientInfo";
import { Step2Documents } from "@/app/screens/Step2Documents";
import { Step3Vitals } from "@/app/screens/Step3Vitals";
import { Step4Loading } from "@/app/screens/Step4Loading";
import { Step4TriageResult } from "@/app/screens/Step4TriageResult";
import { Step5Report } from "@/app/screens/Step5Report";

const SCREEN_STEP: Partial<Record<Screen, number>> = {
  step1: 1, step2: 2, step3: 3, step4_loading: 4, step4: 4, step5: 5,
};

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showConfirm, setShowConfirm] = useState(false);
  const [patientData, setPatientData] = useState<PatientData>({ name: "", age: "", gender: "", transcription: "" });
  const [vitals, setVitals] = useState<Vitals>({ bp: "", hr: "", temp: "", spo2: "", glucose: "" });

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  const goTo = (s: Screen) => setScreen(s);
  const currentStep = SCREEN_STEP[screen] ?? null;

  const handleStartTriage = () => {
    setPatientData({ name: "", age: "", gender: "", transcription: "" });
    setVitals({ bp: "", hr: "", temp: "", spo2: "", glucose: "" });
    goTo("step1");
  };

  const handleStep3Next = () => setShowConfirm(true);

  const handleConfirm = () => {
    setShowConfirm(false);
    goTo("step4_loading");
    setTimeout(() => goTo("step4"), 3500);
  };

  return (
    <div
      className="flex flex-col h-screen max-w-md mx-auto bg-background overflow-hidden"
      style={{ fontFamily: "'Inter', 'Noto Sans Bengali', sans-serif" }}
    >
      {!isOnline && <OfflineBanner lang={lang} />}
      <AppHeader lang={lang} setLang={setLang} onHome={() => goTo("dashboard")} />
      {currentStep && <StepProgressBar step={currentStep} lang={lang} />}

      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex-1 flex flex-col min-h-0 overflow-hidden"
          >
            {screen === "dashboard" && (
              <div className="flex-1 overflow-y-auto">
                <Dashboard onStart={handleStartTriage} lang={lang} />
              </div>
            )}
            {screen === "step1" && (
              <Step1PatientInfo
                data={patientData}
                onChange={(d) => setPatientData((prev) => ({ ...prev, ...d }))}
                onNext={() => goTo("step2")}
                onBack={() => goTo("dashboard")}
                lang={lang}
              />
            )}
            {screen === "step2" && (
              <Step2Documents
                onNext={() => goTo("step3")}
                onBack={() => goTo("step1")}
                lang={lang}
              />
            )}
            {screen === "step3" && (
              <Step3Vitals
                vitals={vitals}
                onChange={(v) => setVitals((prev) => ({ ...prev, ...v }))}
                onNext={handleStep3Next}
                onBack={() => goTo("step2")}
                lang={lang}
              />
            )}
            {screen === "step4_loading" && <Step4Loading lang={lang} />}
            {screen === "step4" && (
              <Step4TriageResult
                patientData={patientData}
                onNext={() => goTo("step5")}
                onBack={() => goTo("step3")}
                lang={lang}
              />
            )}
            {screen === "step5" && (
              <Step5Report
                patientData={patientData}
                vitals={vitals}
                onRestart={() => goTo("dashboard")}
                lang={lang}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <div className="bg-amber-50 border-t border-amber-200 px-4 py-3 text-xs text-amber-800 font-medium text-center leading-relaxed">
        {tx("disclaimer", lang)}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <ConfirmModal
            onConfirm={handleConfirm}
            onCancel={() => setShowConfirm(false)}
            lang={lang}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
