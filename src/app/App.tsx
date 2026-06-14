import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Lang, Screen, PatientData, Vitals, TriageConfig } from "@/app/types";
import { tx } from "@/app/translations";
import { AppHeader } from "@/app/components/shared/AppHeader";
import { OfflineBanner } from "@/app/components/shared/OfflineBanner";
import { StepProgressBar } from "@/app/components/shared/StepProgressBar";
import { ConfirmModal } from "@/app/components/shared/ConfirmModal";
import { Login } from "@/app/screens/Login";
import { Register } from "@/app/screens/Register";
import { Dashboard } from "@/app/screens/Dashboard";
import { Step1PatientInfo } from "@/app/screens/Step1PatientInfo";
import { Step2Documents } from "@/app/screens/Step2Documents";
import { Step3Vitals } from "@/app/screens/Step3Vitals";
import { Step4Loading } from "@/app/screens/Step4Loading";
import { Step4TriageResult } from "@/app/screens/Step4TriageResult";
import { Step5Report } from "@/app/screens/Step5Report";
import type { TriageResponse, AnomalyItem } from "@/app/api";
import { createPatient, analyzeVitals, analyzeTriage, speakReport } from "@/app/api";

const SCREEN_STEP: Partial<Record<Screen, number>> = {
  step1: 1, step2: 2, step3: 3, step4_loading: 4, step4: 4, step5: 5,
};

function mapTriageResponse(r: TriageResponse): TriageConfig {
  const levelMap: Record<string, "critical" | "urgent" | "moderate" | "minor"> = {
    GREEN: "minor", YELLOW: "moderate", RED: "urgent", BLACK: "critical",
  };
  return {
    level: levelMap[r.triageLevel] ?? "moderate",
    score: r.triageScore,
    reasoning: r.reasoning,
    reasoningbn: r.reasoning,
    conditions: r.differentialDiagnoses.map((c) => ({
      en: c.name, bn: c.name, probability: c.probability,
    })),
    firstAid: r.firstAidSteps.map((s) => ({ en: s.step, bn: s.step })),
    referral: {
      en: r.referralNeeded ? (r.referralUrgency ?? "Immediate referral needed") : "No referral needed",
      bn: r.referralNeeded ? (r.referralUrgency ?? "Immediate referral needed") : "No referral needed",
    },
  };
}

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [screen, setScreen] = useState<Screen>(
    localStorage.getItem("token") ? "dashboard" : "login",
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showConfirm, setShowConfirm] = useState(false);
  const [patientData, setPatientData] = useState<PatientData>({ name: "", age: "", gender: "", transcription: "" });
  const [vitals, setVitals] = useState<Vitals>({ bp: "", hr: "", temp: "", spo2: "", glucose: "" });
  const [triageResult, setTriageResult] = useState<TriageConfig | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => { window.removeEventListener("online", onOnline); window.removeEventListener("offline", onOffline); };
  }, []);

  const goTo = (s: Screen) => setScreen(s);
  const currentStep = SCREEN_STEP[screen] ?? null;

  const handleLogin = () => setScreen("dashboard");

  const handleStartTriage = () => {
    setPatientData({ name: "", age: "", gender: "", transcription: "" });
    setVitals({ bp: "", hr: "", temp: "", spo2: "", glucose: "" });
    setTriageResult(null);
    setPatientId(null);
    setAudioUrl(null);
    goTo("step1");
  };

  const handleStep1Next = async () => {
    try {
      const res = await createPatient({
        name: patientData.name,
        age: parseInt(patientData.age) || 0,
        gender: patientData.gender || "other",
      });
      setPatientId(res.patient.id);
    } catch {
      console.warn("Patient creation failed, continuing with mock flow");
    }
    goTo("step2");
  };

  const handleStep3Next = () => setShowConfirm(true);

  const handleConfirm = async () => {
    setShowConfirm(false);
    goTo("step4_loading");

    try {
      let vitalsAnomalies: AnomalyItem[] | undefined;
      const bp = vitals.bp.trim();
      const hr = parseFloat(vitals.hr);
      const temp = parseFloat(vitals.temp);
      const spo2 = parseFloat(vitals.spo2);
      const glucose = parseFloat(vitals.glucose);
      if (bp && !isNaN(hr) && !isNaN(temp) && !isNaN(spo2) && !isNaN(glucose)) {
        const vitalsRes = await analyzeVitals({ bloodPressure: bp, heartRate: hr, temperature: temp, spo2, glucose });
        vitalsAnomalies = vitalsRes.anomalies;
      }
      const triageRes = await analyzeTriage({
        englishSymptoms: patientData.transcription || "No symptoms provided",
        patientAge: parseInt(patientData.age) || 0,
        patientGender: (patientData.gender as "male" | "female" | "other") || "other",
        vitalsAnomalies,
      });
      setTriageResult(mapTriageResponse(triageRes));

      try {
        const audioRes = await speakReport({ text: triageRes.reasoning, language: lang });
        setAudioUrl(audioRes.audioUrl);
      } catch {
        console.warn("TTS failed, audio will be unavailable");
      }
    } catch {
      console.warn("Triage analysis failed, using fallback");
    }
    goTo("step4");
  };

  const handleRestart = () => {
    goTo("dashboard");
  };

  return (
    <div
      className="flex flex-col h-screen max-w-md mx-auto bg-background overflow-hidden"
      style={{ fontFamily: "'Inter', 'Noto Sans Bengali', sans-serif" }}
    >
      {screen !== "login" && !isOnline && <OfflineBanner lang={lang} />}
      {screen !== "login" && <AppHeader lang={lang} setLang={setLang} onHome={() => goTo("dashboard")} />}
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
            {screen === "login" && (
              <Login
                lang={lang}
                onLogin={handleLogin}
                onRegister={() => goTo("register")}
              />
            )}
            {screen === "register" && (
              <Register
                lang={lang}
                onRegister={() => goTo("login")}
                onBackToLogin={() => goTo("login")}
              />
            )}
            {screen === "dashboard" && (
              <div className="flex-1 overflow-y-auto">
                <Dashboard onStart={handleStartTriage} lang={lang} />
              </div>
            )}
            {screen === "step1" && (
              <Step1PatientInfo
                data={patientData}
                onChange={(d) => setPatientData((prev) => ({ ...prev, ...d }))}
                onNext={handleStep1Next}
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
            {screen === "step4" && triageResult && (
              <Step4TriageResult
                patientData={patientData}
                triageResult={triageResult}
                audioUrl={audioUrl}
                onNext={() => goTo("step5")}
                onBack={() => goTo("step3")}
                lang={lang}
              />
            )}
            {screen === "step5" && (
              <Step5Report
                patientData={patientData}
                vitals={vitals}
                triageResult={triageResult}
                patientId={patientId}
                audioUrl={audioUrl}
                onRestart={handleRestart}
                lang={lang}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {screen !== "login" && (
        <div className="bg-amber-50 border-t border-amber-200 px-4 py-3 text-xs text-amber-800 font-medium text-center leading-relaxed">
          {tx("disclaimer", lang)}
        </div>
      )}

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
