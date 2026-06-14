# AI Healthcare Triage Assistant

## Quick start

```bash
pnpm install     # or npm i
pnpm dev         # vite dev server
pnpm build       # vite build
```

No lint, typecheck, or test scripts exist. No tsconfig.json at root — Vite's defaults apply.

## Stack

- **Vite 6** + **React 18** (no router — manual `Screen` state machine in `App.tsx`)
- **Tailwind CSS v4** via `@tailwindcss/vite` plugin (do NOT add `tailwindcss`/`autoprefixer` to PostCSS; `postcss.config.mjs` should stay empty)
- **Motion** (`motion/react`) for animations (formerly Framer Motion)
- **shadcn/ui v4** components in `src/app/components/ui/` — named exports, `data-slot` attributes, `cn()` utility from `utils.ts`, relative imports only
- **Radix UI** primitives, **lucide-react** icons, **Recharts** for charts

## Project structure

| Path | Purpose |
|------|---------|
| `src/main.tsx` | Entrypoint → renders `<App />` |
| `src/app/App.tsx` | SPA orchestrator, screens extracted to `screens/` |
| `src/app/screens/` | One file per screen: Dashboard, Step1–5 |
| `src/app/components/shared/` | AppHeader, OfflineBanner, StepProgressBar, ConfirmModal, AudioPlayer |
| `src/app/components/ui/` | shadcn/ui v4 component library |
| `src/app/components/figma/` | Custom Figma utility components |
| `src/app/types.ts` | Shared types (Lang, Screen, PatientData, Vitals, etc.) |
| `src/app/translations.ts` | Bilingual `T` object + `tx(key, lang)` helper |
| `src/app/utils.ts` | Vital validation, triage config, utility constants |
| `src/app/mock-data.ts` | All mock patient/triage data |
| `src/styles/*.css` | Styles split into `fonts.css`, `tailwind.css`, `theme.css` |
| `guidelines/Guidelines.md` | Template — contains no actual guidelines |
| `default_shadcn_theme.css` | Reference file synced with external source — do not edit directly |

## Conventions

- **Path alias**: `@/` maps to `./src` (configured in `vite.config.ts`)
- **Imports**: UI components use relative `./` paths, app code uses `@/` alias
- **Bilingual**: All UI strings in `T` object keyed by `en`/`bn`; use `tx(key, lang)` helper
- **Offline-first**: App detects `navigator.onLine` and shows offline banner
- **Figma assets**: `figma:asset/` import prefix resolved by custom Vite plugin to `src/assets/`
- **Dark mode**: `.dark` class-based, toggled via CSS custom properties in `theme.css`

## Data flow

All data is **mocked** — no backend. Triage flow: Dashboard → Step 1 (Patient Info + voice recording) → Step 2 (Document upload with OCR mock) → Step 3 (Vitals entry) → Loading → Step 4 (Triage result) → Step 5 (Report).

## Things to watch

- `peerDependencies` list `react`/`react-dom` as optional — not typical
- No `.gitignore` — be careful not to commit `node_modules/`
- `vite.config.ts` comment warns React and Tailwind plugins must both be present even if Tailwind unused
- `assetsInclude` in vite config only accepts `.svg` and `.csv` — do not add `.css`/`.tsx`/`.ts`
