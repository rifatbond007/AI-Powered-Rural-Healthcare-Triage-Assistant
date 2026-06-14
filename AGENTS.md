# AI Healthcare Triage Assistant

## Quick start

```bash
pnpm install     # or npm i
pnpm dev         # vite dev server on :5173
pnpm build       # vite build
```

No lint, typecheck, or test scripts exist. No root tsconfig — Vite defaults apply.

## Frontend stack

- **Vite 6** + **React 18** (no router — `Screen` union type state machine in `App.tsx`)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin — do NOT add `tailwindcss`/`autoprefixer` to PostCSS; `postcss.config.mjs` must stay empty
- **Motion** (`motion/react`) for page transitions
- **shadcn/ui v4** in `src/app/components/ui/` — named exports, `data-slot` attributes, relative `./` imports only, `cn()` from `utils.ts`
- **Radix UI** primitives, **lucide-react** icons, **Recharts** charts
- **MUI** (`@mui/material` + icons) also present alongside shadcn

## Backend (`backend/`)

Separate Express + Prisma + PostgreSQL app with its own `package.json`:

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, OPENAI_API_KEY
pnpm install           # postinstall auto-runs prisma generate
pnpm db:migrate        # create tables
pnpm dev               # tsx watch src/index.ts on :4000
```

| Command | Description |
|---------|-------------|
| `pnpm dev` | Hot-reload dev server (`tsx watch`) |
| `pnpm build` | `tsc` to `dist/` |
| `pnpm start` | Run production build |
| `pnpm db:migrate` | Prisma migration |
| `pnpm db:push` | Push schema without migration |
| `pnpm db:studio` | Prisma Studio GUI |

Swagger docs at `http://localhost:4000/docs`. CORS allows `http://localhost:5173` by default.

## Frontend data flow

All data is **mocked** inside `src/app/mock-data.ts`. The frontend makes no real API calls — it is a pure UI prototype. Triage flow: Dashboard → Step 1 (Patient info + voice recording) → Step 2 (Document upload with static OCR mock) → Step 3 (Vitals entry) → Loading (3.5s delay) → Step 4 (Triage result from `MOCK_TRIAGE`) → Step 5 (Report).

## Conventions

- **Path alias**: `@/` maps to `./src` (`vite.config.ts`); UI components use relative `./` paths, app code uses `@/` alias
- **Bilingual**: All strings in `T` object keyed by `en`/`bn`; use `tx(key, lang)` helper
- **Offline-first**: `navigator.onLine` detection with `<OfflineBanner>`
- **Figma assets**: `figma:asset/` import prefix resolved by custom Vite plugin to `src/assets/`
- **Dark mode**: `.dark` class-based, toggled via CSS custom properties in `theme.css`
- **Triage levels**: Frontend uses `critical`/`urgent`/`moderate`/`minor`; backend Prisma enum uses `GREEN`/`YELLOW`/`RED`/`BLACK` (different naming)
- **Styles**: `src/styles/index.css` aggregates `fonts.css`, `tailwind.css`, `theme.css`

## Things to watch

- `peerDependencies` list `react`/`react-dom` as **optional** (not typical)
- **No `.gitignore`** — be careful not to commit `node_modules/` in either package
- `assetsInclude` only accepts `.svg` and `.csv` — do not add `.css`/`.tsx`/`.ts`
- Vite config: React and Tailwind plugins must both be present even if Tailwind is unused (enforced by Make/Vite constraint)
- Backend requires PostgreSQL 14+ and env vars for AI features (OpenAI, Google Vision)
- `default_shadcn_theme.css` is synced with external source — do not edit directly
- `guidelines/Guidelines.md` is a template placeholder with no actual content
