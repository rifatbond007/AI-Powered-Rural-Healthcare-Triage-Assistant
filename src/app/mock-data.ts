import type { TriageLevel, ExtractedRow, TriageConfig } from "@/app/types";

export const MOCK_CASES = [
  { id: 1, name: "Md. Abdul Rahman", namebn: "মো. আব্দুল রহমান", age: 62, gender: "M", level: "urgent" as TriageLevel, time: "Yesterday", timebn: "গতকাল", condition: "Hypertension", condbn: "উচ্চ রক্তচাপ" },
  { id: 2, name: "Sita Devi",        namebn: "সীতা দেবী",        age: 28, gender: "F", level: "minor" as TriageLevel,  time: "2 days ago", timebn: "২ দিন আগে", condition: "Common cold", condbn: "সাধারণ সর্দি" },
  { id: 3, name: "Md. Karim",        namebn: "মো. করিম",         age: 8,  gender: "M", level: "moderate" as TriageLevel, time: "3 days ago", timebn: "৩ দিন আগে", condition: "Fever & cough", condbn: "জ্বর ও কাশি" },
  { id: 4, name: "Fatima Begum",     namebn: "ফাতিমা বেগম",      age: 55, gender: "F", level: "critical" as TriageLevel, time: "4 days ago", timebn: "৪ দিন আগে", condition: "Cardiac event", condbn: "হার্টের ঘটনা" },
];

export const MOCK_EXTRACTED: ExtractedRow[] = [
  { medication: "Amlodipine",   dosage: "5mg once daily",      diagnosis: "Hypertension" },
  { medication: "Metformin",    dosage: "500mg twice daily",    diagnosis: "Type 2 Diabetes" },
  { medication: "Atorvastatin", dosage: "10mg nightly",        diagnosis: "Hyperlipidemia" },
];

export const MOCK_TRIAGE: TriageConfig = {
  level: "urgent",
  score: 78,
  reasoning: "Patient presents with elevated blood pressure (160/95 mmHg), tachycardia (HR 98), low-grade fever (37.8°C), borderline hypoxia (SpO₂ 94%), and hyperglycemia (220 mg/dL). Combined risk suggests hypertensive urgency with poor glycemic control.",
  reasoningbn: "রোগীর রক্তচাপ বেশি (১৬০/৯৫), হৃদস্পন্দন বেশি (৯৮), হালকা জ্বর (৩৭.৮°C), কম অক্সিজেন (৯৪%) এবং উচ্চ রক্তের শর্করা (২২০)। এই লক্ষণগুলি হাইপারটেনসিভ আর্জেন্সি ইঙ্গিত দেয়।",
  conditions: [
    { en: "Hypertensive urgency", bn: "হাইপারটেনসিভ আর্জেন্সি", probability: "High" },
    { en: "Uncontrolled Type 2 Diabetes", bn: "অনিয়ন্ত্রিত টাইপ ২ ডায়াবেটিস", probability: "High" },
    { en: "Early cardiac decompensation", bn: "প্রাথমিক কার্ডিয়াক ডিকম্পেনসেশন", probability: "Moderate" },
  ],
  firstAid: [
    { en: "Seat patient comfortably, keep calm", bn: "রোগীকে আরামদায়কভাবে বসান, শান্ত রাখুন" },
    { en: "Measure blood pressure every 15 minutes", bn: "প্রতি ১৫ মিনিটে রক্তচাপ মাপুন" },
    { en: "Ensure patient has taken their regular medications", bn: "রোগী তার নিয়মিত ওষুধ খেয়েছে কিনা নিশ্চিত করুন" },
    { en: "Do NOT give additional antihypertensives without physician guidance", bn: "চিকিৎসকের পরামর্শ ছাড়া অতিরিক্ত ওষুধ দেবেন না" },
    { en: "Prepare for urgent referral to district hospital", bn: "জেলা হাসপাতালে জরুরি রেফারেলের প্রস্তুতি নিন" },
  ],
  referral: { en: "Urgent — District Hospital Cardiologist/Medicine within 24 hours", bn: "জরুরি — ২৪ ঘণ্টার মধ্যে জেলা হাসপাতালের কার্ডিওলজিস্ট/মেডিসিন বিশেষজ্ঞ" },
};
