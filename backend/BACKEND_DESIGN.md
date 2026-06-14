# AI-Powered Rural Healthcare Triage & Decision Support — Backend Design

## Tech Stack

- **Language**: TypeScript 5.x
- **Runtime**: Node.js 20+ (LTS)
- **Framework**: Express.js (async request handlers)
- **Database**: PostgreSQL + Prisma ORM (auto-generated types, migrations)
- **Validation**: Zod (runtime type checking + schema inference)
- **Auth**: JWT (`jsonwebtoken`) + bcrypt
- **File uploads**: Multer (local `/uploads` folder)
- **API docs**: Swagger via `swagger-jsdoc` + `swagger-ui-express`
- **Logging**: Pino (structured JSON logs)
- **Rate limiting**: `express-rate-limit`
- **PDF generation**: PDFKit
- **Environment**: `dotenv`

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Entrypoint — starts HTTP server
│   ├── app.ts                # Express app (middleware + route wiring)
│   ├── config.ts             # typed env loader
│   ├── database.ts           # Prisma singleton client
│   ├── routers/
│   │   ├── auth.ts           # POST /auth/register, /auth/login
│   │   ├── intake.ts         # POST /intake/transcribe
│   │   ├── ocr.ts            # POST /ocr/extract
│   │   ├── vitals.ts         # POST /vitals/analyze
│   │   ├── triage.ts         # POST /triage/analyze
│   │   ├── report.ts         # POST /report/speak, /report/generate
│   │   └── patients.ts       # CRUD /patients
│   ├── services/
│   │   ├── speech.ts         # Whisper STT
│   │   ├── translation.ts    # Bengali → English
│   │   ├── ocr.ts            # image → text
│   │   ├── ner.ts            # GPT entity extraction
│   │   ├── llm.ts            # GPT triage reasoning
│   │   ├── anomaly.ts        # Rule-based vitals check
│   │   ├── tts.ts            # Text → speech (mp3)
│   │   └── report.ts         # PDF generation
│   ├── schemas/              # Zod validation schemas
│   │   ├── auth.ts
│   │   ├── intake.ts
│   │   ├── ocr.ts
│   │   ├── vitals.ts
│   │   ├── triage.ts
│   │   └── report.ts
│   ├── middleware/
│   │   ├── auth.ts           # JWT guard
│   │   ├── error.ts          # Global error handler
│   │   ├── upload.ts         # Multer config
│   │   └── rate-limit.ts     # Rate limiter factory
│   └── utils/
│       ├── logger.ts         # Pino instance
│       └── errors.ts         # AppError class
├── prisma/
│   └── schema.prisma         # DB schema + relations
├── uploads/                  # Local file storage
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Database Schema (Prisma)

```prisma
enum TriageLevel { GREEN YELLOW RED BLACK }

model User {
  id              String   @id @default(uuid())
  name            String
  email           String   @unique
  hashedPassword  String
  clinicLocation  String
  createdAt       DateTime @default(now())
  patients        Patient[]
}

model Patient {
  id          String       @id @default(uuid())
  name        String
  age         Int
  gender      String
  chwId       String
  chw         User         @relation(fields: [chwId], references: [id])
  createdAt   DateTime     @default(now())
  triageCases TriageCase[]
}

model TriageCase {
  id                   String       @id @default(uuid())
  patientId            String
  patient              Patient      @relation(fields: [patientId], references: [id])
  symptomsOriginal     String?
  symptomsEnglish      String?
  detectedLanguage     String?
  medicalHistory       Json?
  vitals               Json?
  vitalsAnomalies      Json?
  triageScore          TriageLevel
  reasoning            String?
  differentialDiagnoses Json?
  firstAidSteps        Json?
  referralNeeded       Boolean      @default(false)
  referralUrgency      String?
  reportUrl            String?
  audioUrl             String?
  createdAt            DateTime     @default(now())
}
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | No | Register CHW |
| POST | /auth/login | No | Login → JWT |
| POST | /intake/transcribe | Yes | Audio → text + translate |
| POST | /ocr/extract | Yes | Image → OCR → NER entities |
| POST | /vitals/analyze | Yes | Rule-based anomaly detection |
| POST | /triage/analyze | Yes | GPT triage reasoning |
| POST | /report/speak | Yes | TTS audio of summary |
| POST | /report/generate | Yes | Structured report + PDF |
| POST | /patients | Yes | Create patient |
| GET | /patients | Yes | List patients |
| GET | /patients/:id | Yes | Get full case |

## Service Design

### anomaly.ts — Rule-based vitals check
Safe ranges for Bangladeshi population. Classifies each vital as NORMAL / WARNING / CRITICAL.

### llm.ts — GPT triage reasoning
Engineered system prompt with JSON mode. Forces structured output with Pydantic (Zod) validation of the response. System prompt includes medical disclaimer.

### speech.ts — Whisper STT via OpenAI API
### translation.ts — Bengali→English via GPT or separate translate API
### ocr.ts — Image upload, calls OCR API (Google Vision / Tesseract)
### ner.ts — Extracts medication/dosage/diagnosis entities via GPT
### tts.ts — Text-to-speech via OpenAI TTS API
### report.ts — PDF generation via PDFKit

## Security & Safety

- Passwords hashed with bcrypt (12 rounds)
- JWT expiry: 24h
- File uploads: 5MB limit, image-only validation
- All AI API keys from environment (never hardcoded)
- Structured error responses (never leak stack traces)
- CORS restricted in production
- Rate limit: 10 req/min on AI endpoints, 100 req/min on general endpoints
- Global disclaimer on every triage response

## Running

```bash
cp .env.example .env     # fill in your keys
npx prisma migrate dev   # create tables
npx prisma db seed       # optional seed
npm run dev              # ts-node-dev --respawn src/index.ts
# OR
npm run build && npm start
```

Swagger docs at `http://localhost:4000/docs`
