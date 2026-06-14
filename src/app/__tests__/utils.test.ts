import { describe, it, expect } from "vitest";
import { getVitalStatus, getVitalWarning, TRIAGE_STYLES, VITAL_DOT } from "@/app/utils";

describe("getVitalStatus", () => {
  describe("hr", () => {
    it("returns normal for 60-100", () => { expect(getVitalStatus("hr", "75")).toBe("normal"); });
    it("returns normal for boundary 60", () => { expect(getVitalStatus("hr", "60")).toBe("normal"); });
    it("returns normal for boundary 100", () => { expect(getVitalStatus("hr", "100")).toBe("normal"); });
    it("returns warning for 50-59", () => { expect(getVitalStatus("hr", "55")).toBe("warning"); });
    it("returns warning for 101-120", () => { expect(getVitalStatus("hr", "110")).toBe("warning"); });
    it("returns warning for boundary 50", () => { expect(getVitalStatus("hr", "50")).toBe("warning"); });
    it("returns warning for boundary 120", () => { expect(getVitalStatus("hr", "120")).toBe("warning"); });
    it("returns critical for <50", () => { expect(getVitalStatus("hr", "40")).toBe("critical"); });
    it("returns critical for >120", () => { expect(getVitalStatus("hr", "130")).toBe("critical"); });
    it("returns empty for empty string", () => { expect(getVitalStatus("hr", "")).toBe("empty"); });
    it("returns empty for malformed input", () => { expect(getVitalStatus("hr", "abc")).toBe("empty"); });
  });

  describe("temp", () => {
    it("returns normal for 36.1-37.2", () => { expect(getVitalStatus("temp", "36.5")).toBe("normal"); });
    it("returns normal for boundary 36.1", () => { expect(getVitalStatus("temp", "36.1")).toBe("normal"); });
    it("returns normal for boundary 37.2", () => { expect(getVitalStatus("temp", "37.2")).toBe("normal"); });
    it("returns warning for 37.3-38.5", () => { expect(getVitalStatus("temp", "37.5")).toBe("warning"); });
    it("returns warning for boundary 38.5", () => { expect(getVitalStatus("temp", "38.5")).toBe("warning"); });
    it("returns critical for >38.5", () => { expect(getVitalStatus("temp", "39")).toBe("critical"); });
    it("returns critical for <36.1", () => { expect(getVitalStatus("temp", "35")).toBe("critical"); });
    it("returns empty for empty string", () => { expect(getVitalStatus("temp", "")).toBe("empty"); });
    it("returns empty for malformed input", () => { expect(getVitalStatus("temp", "abc")).toBe("empty"); });
  });

  describe("spo2", () => {
    it("returns normal for >=95", () => { expect(getVitalStatus("spo2", "96")).toBe("normal"); });
    it("returns normal for boundary 95", () => { expect(getVitalStatus("spo2", "95")).toBe("normal"); });
    it("returns warning for 90-94", () => { expect(getVitalStatus("spo2", "92")).toBe("warning"); });
    it("returns warning for boundary 90", () => { expect(getVitalStatus("spo2", "90")).toBe("warning"); });
    it("returns critical for <90", () => { expect(getVitalStatus("spo2", "85")).toBe("critical"); });
    it("returns empty for empty string", () => { expect(getVitalStatus("spo2", "")).toBe("empty"); });
  });

  describe("glucose", () => {
    it("returns normal for 70-140", () => { expect(getVitalStatus("glucose", "100")).toBe("normal"); });
    it("returns normal for boundary 70", () => { expect(getVitalStatus("glucose", "70")).toBe("normal"); });
    it("returns normal for boundary 140", () => { expect(getVitalStatus("glucose", "140")).toBe("normal"); });
    it("returns warning for 55-69", () => { expect(getVitalStatus("glucose", "60")).toBe("warning"); });
    it("returns warning for 141-200", () => { expect(getVitalStatus("glucose", "180")).toBe("warning"); });
    it("returns warning for boundary 55", () => { expect(getVitalStatus("glucose", "55")).toBe("warning"); });
    it("returns warning for boundary 200", () => { expect(getVitalStatus("glucose", "200")).toBe("warning"); });
    it("returns critical for <55", () => { expect(getVitalStatus("glucose", "50")).toBe("critical"); });
    it("returns critical for >200", () => { expect(getVitalStatus("glucose", "250")).toBe("critical"); });
    it("returns empty for empty string", () => { expect(getVitalStatus("glucose", "")).toBe("empty"); });
  });

  describe("bp", () => {
    it("returns normal for <=120/80", () => { expect(getVitalStatus("bp", "120/80")).toBe("normal"); });
    it("returns warning for 121-140/81-90", () => { expect(getVitalStatus("bp", "135/85")).toBe("warning"); });
    it("returns warning for boundary 140/90", () => { expect(getVitalStatus("bp", "140/90")).toBe("warning"); });
    it("returns critical for >140/90", () => { expect(getVitalStatus("bp", "150/100")).toBe("critical"); });
    it("returns empty for empty string", () => { expect(getVitalStatus("bp", "")).toBe("empty"); });
    it("returns empty for missing slash", () => { expect(getVitalStatus("bp", "120")).toBe("empty"); });
    it("returns empty for non-numeric sys", () => { expect(getVitalStatus("bp", "abc/80")).toBe("empty"); });
    it("returns empty for non-numeric dia", () => { expect(getVitalStatus("bp", "120/abc")).toBe("empty"); });
    it("returns empty for both non-numeric", () => { expect(getVitalStatus("bp", "abc/def")).toBe("empty"); });
  });

  describe("unknown field", () => {
    it("returns normal", () => { expect(getVitalStatus("unknown", "100")).toBe("normal"); });
  });
});

describe("getVitalWarning", () => {
  it("returns empty string for normal status", () => { expect(getVitalWarning("hr", "75", "en")).toBe(""); });
  it("returns empty string for empty value", () => { expect(getVitalWarning("hr", "", "en")).toBe(""); });
  it("returns empty string for unknown field", () => { expect(getVitalWarning("unknown", "50", "en")).toBe(""); });

  describe("hr", () => {
    it("returns warning in English", () => { expect(getVitalWarning("hr", "55", "en")).toBe("Heart rate slightly abnormal"); });
    it("returns warning in Bengali", () => { expect(getVitalWarning("hr", "55", "bn")).toBe("হৃদস্পন্দন সামান্য অস্বাভাবিক"); });
    it("returns critical in English", () => { expect(getVitalWarning("hr", "40", "en")).toBe("Heart rate dangerously abnormal"); });
    it("returns critical in Bengali", () => { expect(getVitalWarning("hr", "40", "bn")).toBe("হৃদস্পন্দন বিপজ্জনকভাবে অস্বাভাবিক"); });
  });

  describe("temp", () => {
    it("returns warning in English", () => { expect(getVitalWarning("temp", "37.5", "en")).toBe("Elevated temperature — monitor closely"); });
    it("returns warning in Bengali", () => { expect(getVitalWarning("temp", "37.5", "bn")).toBe("তাপমাত্রা বেশি — ঘনিষ্ঠভাবে পর্যবেক্ষণ করুন"); });
    it("returns critical in English", () => { expect(getVitalWarning("temp", "39", "en")).toBe("High fever detected"); });
    it("returns critical in Bengali", () => { expect(getVitalWarning("temp", "39", "bn")).toBe("উচ্চ জ্বর শনাক্ত"); });
  });

  describe("spo2", () => {
    it("returns warning in English", () => { expect(getVitalWarning("spo2", "92", "en")).toBe("Oxygen level low — supplemental O₂ may be needed"); });
    it("returns critical in English", () => { expect(getVitalWarning("spo2", "85", "en")).toBe("Critical hypoxia — act immediately"); });
    it("returns critical in Bengali", () => { expect(getVitalWarning("spo2", "85", "bn")).toBe("সংকটজনক হাইপক্সিয়া — তাৎক্ষণিক ব্যবস্থা নিন"); });
  });

  describe("glucose", () => {
    it("returns warning low in English", () => { expect(getVitalWarning("glucose", "60", "en")).toBe("Blood glucose low — risk of hypoglycemia"); });
    it("returns warning high in English", () => { expect(getVitalWarning("glucose", "180", "en")).toBe("Blood glucose elevated"); });
    it("returns warning low in Bengali", () => { expect(getVitalWarning("glucose", "60", "bn")).toBe("রক্তের শর্করা কম"); });
    it("returns warning high in Bengali", () => { expect(getVitalWarning("glucose", "180", "bn")).toBe("রক্তের শর্করা বেশি"); });
    it("returns critical low in English", () => { expect(getVitalWarning("glucose", "50", "en")).toBe("Severe hypoglycemia"); });
    it("returns critical high in English", () => { expect(getVitalWarning("glucose", "250", "en")).toBe("Dangerously high glucose"); });
    it("returns critical low in Bengali", () => { expect(getVitalWarning("glucose", "50", "bn")).toBe("গুরুতর হাইপোগ্লাইসেমিয়া"); });
    it("returns critical high in Bengali", () => { expect(getVitalWarning("glucose", "250", "bn")).toBe("অত্যন্ত উচ্চ গ্লুকোজ"); });
  });
});

describe("TRIAGE_STYLES", () => {
  it("has 4 entries", () => { expect(Object.keys(TRIAGE_STYLES)).toHaveLength(4); });
  it("has correct keys", () => {
    expect(TRIAGE_STYLES).toHaveProperty("critical");
    expect(TRIAGE_STYLES).toHaveProperty("urgent");
    expect(TRIAGE_STYLES).toHaveProperty("moderate");
    expect(TRIAGE_STYLES).toHaveProperty("minor");
  });
  it("critical has bg-gray-800, text-white, hex #1F2937", () => {
    expect(TRIAGE_STYLES.critical).toEqual({ bg: "bg-gray-800", text: "text-white", hex: "#1F2937" });
  });
  it("urgent has bg-red-500, text-white, hex #EF4444", () => {
    expect(TRIAGE_STYLES.urgent).toEqual({ bg: "bg-red-500", text: "text-white", hex: "#EF4444" });
  });
  it("moderate has bg-yellow-500, text-gray-900, hex #EAB308", () => {
    expect(TRIAGE_STYLES.moderate).toEqual({ bg: "bg-yellow-500", text: "text-gray-900", hex: "#EAB308" });
  });
  it("minor has bg-green-500, text-white, hex #22C55E", () => {
    expect(TRIAGE_STYLES.minor).toEqual({ bg: "bg-green-500", text: "text-white", hex: "#22C55E" });
  });
});

describe("VITAL_DOT", () => {
  it("has 4 entries", () => { expect(Object.keys(VITAL_DOT)).toHaveLength(4); });
  it("normal is bg-green-500", () => { expect(VITAL_DOT.normal).toBe("bg-green-500"); });
  it("warning is bg-yellow-400", () => { expect(VITAL_DOT.warning).toBe("bg-yellow-400"); });
  it("critical is bg-red-500", () => { expect(VITAL_DOT.critical).toBe("bg-red-500"); });
  it("empty is bg-gray-300", () => { expect(VITAL_DOT.empty).toBe("bg-gray-300"); });
});
