import { describe, it, expect } from "vitest";
import { analyzeVitals } from "../services/anomaly.js";

describe("analyzeVitals", () => {
  const normalVitals = {
    bloodPressure: "120/80",
    heartRate: 75,
    temperature: 36.8,
    spo2: 98,
    glucose: 100,
  };

  it("returns NORMAL for normal vitals", () => {
    const result = analyzeVitals(normalVitals);
    expect(result.overallSeverity).toBe("NORMAL");
    expect(result.anomalies).toHaveLength(6);
    for (const a of result.anomalies) {
      expect(a.severity).toBe("NORMAL");
    }
  });

  it("returns WARNING severity for warning-range vitals", () => {
    const result = analyzeVitals({ ...normalVitals, heartRate: 110 });
    expect(result.overallSeverity).toBe("WARNING");
    const hr = result.anomalies.find((a) => a.vital === "heart_rate");
    expect(hr?.severity).toBe("WARNING");
  });

  it("returns CRITICAL severity for critical-range vitals", () => {
    const result = analyzeVitals({ ...normalVitals, heartRate: 130 });
    expect(result.overallSeverity).toBe("CRITICAL");
    const hr = result.anomalies.find((a) => a.vital === "heart_rate");
    expect(hr?.severity).toBe("CRITICAL");
  });

  it("correctly determines overallSeverity from mixed vitals", () => {
    const result = analyzeVitals({ ...normalVitals, spo2: 92, heartRate: 130 });
    expect(result.overallSeverity).toBe("CRITICAL");
  });

  it("correctly splits blood pressure into systolic and diastolic", () => {
    const result = analyzeVitals({ ...normalVitals, bloodPressure: "140/90" });
    const sys = result.anomalies.find((a) => a.vital === "blood_pressure_systolic");
    const dia = result.anomalies.find((a) => a.vital === "blood_pressure_diastolic");
    expect(sys?.value).toBe(140);
    expect(dia?.value).toBe(90);
    expect(sys?.severity).toBe("WARNING");
    expect(dia?.severity).toBe("WARNING");
  });

  describe("boundary values", () => {
    it("treats exactly min as NORMAL", () => {
      const result = analyzeVitals({ ...normalVitals, heartRate: 60 });
      expect(result.anomalies.find((a) => a.vital === "heart_rate")?.severity).toBe("NORMAL");
    });

    it("treats exactly max as NORMAL", () => {
      const result = analyzeVitals({ ...normalVitals, heartRate: 100 });
      expect(result.anomalies.find((a) => a.vital === "heart_rate")?.severity).toBe("NORMAL");
    });

    it("treats exactly warnMin as WARNING", () => {
      const result = analyzeVitals({ ...normalVitals, heartRate: 50 });
      expect(result.anomalies.find((a) => a.vital === "heart_rate")?.severity).toBe("WARNING");
    });

    it("treats exactly warnMax as WARNING", () => {
      const result = analyzeVitals({ ...normalVitals, heartRate: 120 });
      expect(result.anomalies.find((a) => a.vital === "heart_rate")?.severity).toBe("WARNING");
    });

    it("treats just below warnMin as CRITICAL", () => {
      const result = analyzeVitals({ ...normalVitals, heartRate: 49 });
      expect(result.anomalies.find((a) => a.vital === "heart_rate")?.severity).toBe("CRITICAL");
    });

    it("treats just above warnMax as CRITICAL", () => {
      const result = analyzeVitals({ ...normalVitals, heartRate: 121 });
      expect(result.anomalies.find((a) => a.vital === "heart_rate")?.severity).toBe("CRITICAL");
    });
  });

  it("each anomaly has correct structure", () => {
    const result = analyzeVitals(normalVitals);
    for (const a of result.anomalies) {
      expect(a).toHaveProperty("vital");
      expect(a).toHaveProperty("value");
      expect(a).toHaveProperty("range");
      expect(a.range).toHaveProperty("min");
      expect(a.range).toHaveProperty("max");
      expect(a).toHaveProperty("severity");
      expect(a).toHaveProperty("message");
    }
  });
});
