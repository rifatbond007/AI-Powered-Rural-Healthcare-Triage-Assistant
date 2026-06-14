import PDFDocument from "pdfkit";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { logger } from "../utils/logger.js";
import { AppError } from "../utils/errors.js";

interface ReportData {
  patientName: string;
  patientAge: number;
  patientGender: string;
  chwName: string;
  clinicLocation: string;
  date: string;
  symptomsEnglish?: string;
  vitals?: Record<string, unknown>;
  vitalsAnomalies?: Array<{ vital: string; value: unknown; severity: string; message: string }>;
  triageLevel: string;
  triageScore: number;
  reasoning: string;
  differentialDiagnoses: Array<{ name: string; probability: string }>;
  firstAidSteps: Array<{ step: string }>;
  referralNeeded: boolean;
  referralUrgency?: string;
}

export async function generatePdf(data: ReportData): Promise<string> {
  try {
    const filename = `report-${Date.now()}.pdf`;
    const filePath = path.resolve("uploads", filename);

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = require("node:fs").createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).font("Helvetica-Bold").text("Patient Triage Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica").fillColor("#666")
      .text(`Generated: ${data.date}`, { align: "center" });
    doc.moveDown(1);

    doc.fontSize(12).fillColor("#000");
    doc.font("Helvetica-Bold").text("Patient Information");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(11);
    doc.text(`Name: ${data.patientName}`);
    doc.text(`Age: ${data.patientAge}`);
    doc.text(`Gender: ${data.patientGender}`);
    doc.text(`CHW: ${data.chwName} — ${data.clinicLocation}`);
    doc.moveDown(1);

    if (data.symptomsEnglish) {
      doc.font("Helvetica-Bold").fontSize(12).text("Reported Symptoms");
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(11).text(data.symptomsEnglish);
      doc.moveDown(1);
    }

    if (data.vitals) {
      doc.font("Helvetica-Bold").fontSize(12).text("Vitals");
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(11);
      for (const [key, val] of Object.entries(data.vitals)) {
        doc.text(`${key}: ${val}`);
      }
      doc.moveDown(0.5);
    }

    if (data.vitalsAnomalies && data.vitalsAnomalies.length > 0) {
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#c00").text("Vital Anomalies");
      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(11).fillColor("#000");
      for (const a of data.vitalsAnomalies) {
        doc.text(`• ${a.vital}: ${a.message} [${a.severity}]`);
      }
      doc.moveDown(1);
    }

    doc.font("Helvetica-Bold").fontSize(12).text(`Triage Level: ${data.triageLevel} (Score: ${data.triageScore}/100)`);
    doc.moveDown(0.5);
    doc.font("Helvetica").fontSize(11).text(data.reasoning);
    doc.moveDown(1);

    doc.font("Helvetica-Bold").fontSize(12).text("Differential Diagnoses");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(11);
    for (const d of data.differentialDiagnoses) {
      doc.text(`• ${d.name} (${d.probability} probability)`);
    }
    doc.moveDown(1);

    doc.font("Helvetica-Bold").fontSize(12).text("First-Aid Steps");
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(11);
    for (const f of data.firstAidSteps) {
      doc.text(`• ${f.step}`);
    }
    doc.moveDown(1);

    if (data.referralNeeded) {
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#c00").text(`Referral Needed: ${data.referralUrgency ?? "Yes"}`);
    }

    doc.moveDown(2);
    doc.fontSize(9).fillColor("#999")
      .text("AI decision support only — not a medical diagnosis. Always use professional judgment.", { align: "center" });

    doc.end();

    return new Promise<string>((resolve, reject) => {
      stream.on("finish", () => {
        logger.info({ filename }, "PDF report saved");
        resolve(filePath);
      });
      stream.on("error", reject);
    });
  } catch (err) {
    logger.error({ err }, "PDF generation failed");
    throw AppError.internal("PDF generation failed");
  }
}
