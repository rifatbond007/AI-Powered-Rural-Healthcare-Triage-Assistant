-- CreateEnum
CREATE TYPE "TriageLevel" AS ENUM ('GREEN', 'YELLOW', 'RED', 'BLACK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "clinicLocation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "chwId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TriageCase" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "symptomsOriginal" TEXT,
    "symptomsEnglish" TEXT,
    "detectedLanguage" TEXT,
    "medicalHistory" JSONB,
    "vitals" JSONB,
    "vitalsAnomalies" JSONB,
    "triageScore" "TriageLevel" NOT NULL,
    "reasoning" TEXT,
    "differentialDiagnoses" JSONB,
    "firstAidSteps" JSONB,
    "referralNeeded" BOOLEAN NOT NULL DEFAULT false,
    "referralUrgency" TEXT,
    "reportUrl" TEXT,
    "audioUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TriageCase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_chwId_fkey" FOREIGN KEY ("chwId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriageCase" ADD CONSTRAINT "TriageCase_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
