# RuralCare Triage Backend

AI-Powered Rural Healthcare Triage & Decision Support System.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- pnpm (recommended) or npm

## Setup

```bash
# Install dependencies
pnpm install

# Copy and fill in environment variables
cp .env.example .env

# Create the database
createdb ruralcare_triage

# Run migrations
npx prisma migrate dev

# (Optional) Seed with sample data
npx prisma db seed

# Start development server
pnpm dev
```

## API Docs

Open `http://localhost:4000/docs` in your browser for interactive Swagger docs.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server with hot reload |
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm start` | Start production server |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:studio` | Open Prisma Studio (GUI DB viewer) |
| `pnpm db:push` | Push schema to DB without migration |

## Environment Variables

See `.env.example` for all required variables. Key ones:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for signing tokens (min 32 chars)
- `OPENAI_API_KEY` — OpenAI key (Whisper, GPT, TTS)
- `GOOGLE_CLOUD_VISION_API_KEY` — For OCR (optional, falls back to Tesseract)

## Architecture

```
POST /intake/transcribe  →  Whisper STT  →  GPT Translate  →  text
POST /ocr/extract        →  OCR (Vision/Tesseract)  →  GPT NER  →  entities
POST /vitals/analyze     →  Rule engine  →  severity
POST /triage/analyze     →  GPT-4 clinical reasoning  →  triage result
POST /report/speak       →  OpenAI TTS  →  mp3
POST /report/generate    →  PDFKit  →  PDF
```

## Disclaimer

This system provides AI decision support only — not a medical diagnosis.
Always use professional clinical judgment.
