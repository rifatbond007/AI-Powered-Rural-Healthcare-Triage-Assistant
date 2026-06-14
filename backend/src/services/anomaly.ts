import type { VitalsInput, AnomalyItem } from "../schemas/vitals.js";

interface VitalRange {
  min: number;
  max: number;
  warnMin: number;
  warnMax: number;
  unit: string;
}

const SAFE_RANGES: Record<string, VitalRange> = {
  bloodPressureSystolic: { min: 90, max: 120, warnMin: 80, warnMax: 140, unit: "mmHg" },
  bloodPressureDiastolic: { min: 60, max: 80, warnMin: 50, warnMax: 90, unit: "mmHg" },
  heartRate: { min: 60, max: 100, warnMin: 50, warnMax: 120, unit: "bpm" },
  temperature: { min: 36.1, max: 37.2, warnMin: 35.5, warnMax: 38.5, unit: "°C" },
  spo2: { min: 95, max: 100, warnMin: 90, warnMax: 100, unit: "%" },
  glucose: { min: 70, max: 140, warnMin: 55, warnMax: 200, unit: "mg/dL" },
};

function classify(value: number, range: VitalRange): { severity: "NORMAL" | "WARNING" | "CRITICAL"; message: string } {
  if (value >= range.min && value <= range.max) {
    return { severity: "NORMAL", message: "Within normal range" };
  }
  if (value >= range.warnMin && value <= range.warnMax) {
    return { severity: "WARNING", message: `Slightly abnormal (${value} ${range.unit})` };
  }
  return { severity: "CRITICAL", message: `Dangerously abnormal (${value} ${range.unit})` };
}

export function analyzeVitals(input: VitalsInput): {
  anomalies: AnomalyItem[];
  overallSeverity: "NORMAL" | "WARNING" | "CRITICAL";
} {
  const [sysStr, diaStr] = input.bloodPressure.split("/");
  const systolic = Number(sysStr);
  const diastolic = Number(diaStr);

  const results: AnomalyItem[] = [
    {
      vital: "blood_pressure_systolic",
      value: systolic,
      range: { min: SAFE_RANGES.bloodPressureSystolic.min, max: SAFE_RANGES.bloodPressureSystolic.max },
      ...classify(systolic, SAFE_RANGES.bloodPressureSystolic),
    },
    {
      vital: "blood_pressure_diastolic",
      value: diastolic,
      range: { min: SAFE_RANGES.bloodPressureDiastolic.min, max: SAFE_RANGES.bloodPressureDiastolic.max },
      ...classify(diastolic, SAFE_RANGES.bloodPressureDiastolic),
    },
    {
      vital: "heart_rate",
      value: input.heartRate,
      range: { min: SAFE_RANGES.heartRate.min, max: SAFE_RANGES.heartRate.max },
      ...classify(input.heartRate, SAFE_RANGES.heartRate),
    },
    {
      vital: "temperature",
      value: input.temperature,
      range: { min: SAFE_RANGES.temperature.min, max: SAFE_RANGES.temperature.max },
      ...classify(input.temperature, SAFE_RANGES.temperature),
    },
    {
      vital: "spo2",
      value: input.spo2,
      range: { min: SAFE_RANGES.spo2.min, max: SAFE_RANGES.spo2.max },
      ...classify(input.spo2, SAFE_RANGES.spo2),
    },
    {
      vital: "glucose",
      value: input.glucose,
      range: { min: SAFE_RANGES.glucose.min, max: SAFE_RANGES.glucose.max },
      ...classify(input.glucose, SAFE_RANGES.glucose),
    },
  ];

  const hasCritical = results.some((r) => r.severity === "CRITICAL");
  const hasWarning = results.some((r) => r.severity === "WARNING");
  const overallSeverity = hasCritical ? "CRITICAL" : hasWarning ? "WARNING" : "NORMAL";

  return { anomalies: results, overallSeverity };
}
