import type { Lang, VitalStatus } from "@/app/types";

export function getVitalStatus(field: string, value: string): VitalStatus {
  if (!value.trim()) return "empty";
  const n = parseFloat(value);
  if (isNaN(n)) return "empty";
  switch (field) {
    case "hr":   return n >= 60 && n <= 100 ? "normal" : n >= 50 && n <= 120 ? "warning" : "critical";
    case "temp": return n >= 36.1 && n <= 37.2 ? "normal" : n >= 37.3 && n <= 38.5 ? "warning" : "critical";
    case "spo2": return n >= 95 ? "normal" : n >= 90 ? "warning" : "critical";
    case "glucose": return n >= 70 && n <= 140 ? "normal" : n >= 55 && n <= 200 ? "warning" : "critical";
    case "bp": {
      const parts = value.split("/");
      if (parts.length !== 2) return "empty";
      const sys = parseFloat(parts[0]);
      const dia = parseFloat(parts[1]);
      if (isNaN(sys) || isNaN(dia)) return "empty";
      return sys <= 120 && dia <= 80 ? "normal" : sys <= 140 && dia <= 90 ? "warning" : "critical";
    }
    default: return "normal";
  }
}

export function getVitalWarning(field: string, value: string, lang: Lang): string {
  const status = getVitalStatus(field, value);
  if (status !== "critical" && status !== "warning") return "";
  const n = parseFloat(value);
  const warnings: Record<string, Record<VitalStatus, { en: string; bn: string }>> = {
    hr: {
      warning:  { en: "Heart rate slightly abnormal", bn: "হৃদস্পন্দন সামান্য অস্বাভাবিক" },
      critical: { en: "Heart rate dangerously abnormal", bn: "হৃদস্পন্দন বিপজ্জনকভাবে অস্বাভাবিক" },
      normal: { en: "", bn: "" }, empty: { en: "", bn: "" },
    },
    temp: {
      warning:  { en: "Elevated temperature — monitor closely", bn: "তাপমাত্রা বেশি — ঘনিষ্ঠভাবে পর্যবেক্ষণ করুন" },
      critical: { en: "High fever detected", bn: "উচ্চ জ্বর শনাক্ত" },
      normal: { en: "", bn: "" }, empty: { en: "", bn: "" },
    },
    spo2: {
      warning:  { en: "Oxygen level low — supplemental O₂ may be needed", bn: "অক্সিজেন কম — অতিরিক্ত O₂ প্রয়োজন হতে পারে" },
      critical: { en: "Critical hypoxia — act immediately", bn: "সংকটজনক হাইপক্সিয়া — তাৎক্ষণিক ব্যবস্থা নিন" },
      normal: { en: "", bn: "" }, empty: { en: "", bn: "" },
    },
    glucose: {
      warning:  { en: n < 70 ? "Blood glucose low — risk of hypoglycemia" : "Blood glucose elevated", bn: n < 70 ? "রক্তের শর্করা কম" : "রক্তের শর্করা বেশি" },
      critical: { en: n < 55 ? "Severe hypoglycemia" : "Dangerously high glucose", bn: n < 55 ? "গুরুতর হাইপোগ্লাইসেমিয়া" : "অত্যন্ত উচ্চ গ্লুকোজ" },
      normal: { en: "", bn: "" }, empty: { en: "", bn: "" },
    },
  };
  const fieldWarnings = warnings[field];
  if (!fieldWarnings) return "";
  return fieldWarnings[status]?.[lang] ?? "";
}

export const TRIAGE_STYLES: Record<string, { bg: string; text: string; hex: string }> = {
  critical: { bg: "bg-gray-800", text: "text-white", hex: "#1F2937" },
  urgent:   { bg: "bg-red-500", text: "text-white", hex: "#EF4444" },
  moderate: { bg: "bg-yellow-500", text: "text-gray-900", hex: "#EAB308" },
  minor:    { bg: "bg-green-500", text: "text-white", hex: "#22C55E" },
};

export const VITAL_DOT: Record<VitalStatus, string> = {
  normal:   "bg-green-500",
  warning:  "bg-yellow-400",
  critical: "bg-red-500",
  empty:    "bg-gray-300",
};
