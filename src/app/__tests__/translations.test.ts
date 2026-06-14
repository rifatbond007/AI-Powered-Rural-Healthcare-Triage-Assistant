import { describe, it, expect } from "vitest";
import { tx, STEP_LABELS } from "@/app/translations";

describe("tx", () => {
  it("returns English string for lang en", () => {
    expect(tx("appName", "en")).toBe("RuralCare AI");
  });
  it("returns Bengali string for lang bn", () => {
    expect(tx("appName", "bn")).toBe("গ্রামীণ স্বাস্থ্য AI");
  });
  it("falls back to English when lang key does not exist in T entry", () => {
    expect(tx("appName", "en")).toBe("RuralCare AI");
  });
  it("returns different values for different keys", () => {
    expect(tx("loginTitle", "en")).toBe("CHW Login");
    expect(tx("newTriage", "en")).toBe("Start New Patient Triage");
  });
  it("returns Bengali for multiple keys", () => {
    expect(tx("greeting", "bn")).toBe("শুভ সকাল,");
    expect(tx("location", "bn")).toBe("সিলেট গ্রামীণ স্বাস্থ্য কেন্দ্র");
  });
});

describe("STEP_LABELS", () => {
  it("has 5 steps in English", () => { expect(STEP_LABELS.en).toHaveLength(5); });
  it("has 5 steps in Bengali", () => { expect(STEP_LABELS.bn).toHaveLength(5); });
  it("contains correct English step labels", () => {
    expect(STEP_LABELS.en).toEqual(["Patient Info", "Documents", "Vitals", "Triage", "Report"]);
  });
  it("contains correct Bengali step labels", () => {
    expect(STEP_LABELS.bn).toEqual(["রোগীর তথ্য", "নথিপত্র", "ভাইটাল", "ট্রিয়াজ", "রিপোর্ট"]);
  });
  it("has matching lengths for both languages", () => {
    expect(STEP_LABELS.en.length).toBe(STEP_LABELS.bn.length);
  });
});
