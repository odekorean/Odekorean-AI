# OdeKorean

AI-powered Korean learning platform. Next.js 15 (App Router) + TypeScript + Tailwind + Supabase + Claude.

## What's built (Phase 1 — foundation)

- **Design system**: "Hangul Aurora" tokens in `tailwind.config.ts` — Apple-keynote clarity (large type,
  soft shadow, generous white space) with a gradient derived from the Korean flag instead of a generic
  purple SaaS gradient. Signature hero element: `HangulConstellation`.
- **Database**: full schema in `supabase/schema.sql` — profiles, languages, categories, lessons (video/pdf/
  vocab/grammar/TOPIK/speaking/listening/reading/writing), quizzes + auto-scoring, TOPIK exams with sections
  and timed attempts, AI conversations + usage logs, progress/streaks/achievements/daily plans/weekly goals,
  subscriptions (billing-ready), analytics events. Row Level Security policies included. A trigger
  auto-creates `profiles`/`streaks`/`subscriptions` rows on signup.
- **Auth**: Supabase email/password login + registration (`(auth)/login`, `(auth)/register`), session
  refresh in `middleware.ts`, route protection for `/dashboard`, `/admin`, `/ai-teacher`, `/topik`.
- **Student app**: dashboard (streak, continue-learning, weekly goal ring), lesson player that renders
  video (YouTube auto-embed or uploaded file), PDF (in-browser + download), vocabulary/grammar JSON content;
  AI Teacher chat wired live to Claude (`/api/ai-teacher`); TOPIK Center with a real countdown-timer mock
  exam and instant auto-grading.
- **Admin app**: role-gated layout, analytics overview (users/signups/lessons/AI usage), full lesson
  list + create/edit form with YouTube-URL auto-detection and PDF upload to Supabase Storage.
- **Multi-language architecture**: every content table is scoped by `language_id`; `src/lib/i18n/config.ts`
  is the single place to flip on English/Japanese/Russian/Chinese later — no schema or route rewrites needed.

## Phase 2 — done

- **Quiz Builder** (`/admin/quizzes`): create/edit multiple-choice, fill-in-the-blank, listening, and
  TOPIK-style questions; includes an "AI-assisted draft" button (`generateQuizQuestionsWithAi`) that has
  Claude draft 5 questions for a topic/level, which the admin reviews before saving.
- **TOPIK exam authoring** (`/admin/topik`): build a full exam as named sections (Listening/Reading/Writing)
  each containing questions with passage/audio support — no more manual SQL needed.
- **Settings** (`/settings`): profile editing, password change, dark-mode toggle (persisted to
  `localStorage`, toggles the `dark` class Tailwind's `darkMode: "class"` expects), and a notifications
  panel (UI built; wire to a `notification_preferences` table + scheduled job next).
- **Lessons library** (`/lessons`) and **Vocabulary browser** (`/vocabulary`) for students, both filterable.
- **Progress & reports** (`/progress`): streak, completed-lesson count, achievements grid, and a weekly
  activity chart (recharts) — the chart currently reads from `weekly_goals` as a placeholder distribution;
  swap in a real per-day aggregation once session-level time tracking exists.
- **AI daily study plan**: `/api/ai/study-plan` has Claude generate 3–5 tasks based on level + recent
  completions, saved to `daily_plans` and rendered as a checklist (`DailyPlanCard`) on the dashboard.

## Still stubbed / Phase 3

- Speaking practice (pronunciation scoring) — needs a speech-to-text/pronunciation-scoring provider
- Certificates and monthly PDF report generation
- Achievement unlock logic (the `achievements`/`user_achievements` tables and UI exist; the trigger that
  actually grants them on milestones — e.g. "10 lessons completed" — still needs to be written)
- Stripe billing (schema/`subscriptions` table ready; checkout + webhooks not yet wired)
- Real `Database` types — run `supabase gen types typescript` once your project exists (see `src/types/database.ts`)
- Notification delivery (email/push) behind the Settings toggles

## A note on build verification

This code was written and statically reviewed (import resolution, export matching, brace/paren balance,
Suspense boundaries, server-action export rules, Tailwind token usage — all cross-checked with scripts)
in a sandboxed environment with **no network egress**, so `npm install` could not actually be run here.
Please run the standard checks after downloading:

```bash
npm install
npm run typecheck
npm run lint
npm run dev
```

If anything surfaces, share the exact error and it'll get fixed immediately.

## Setup

1. **Supabase**: create a project, run `supabase/schema.sql` in the SQL editor, create a public Storage
   bucket named `lesson-assets`.
2. **Env vars**: copy `.env.example` to `.env.local` and fill in Supabase + `ANTHROPIC_API_KEY`.
3. **Install & run**:
   ```bash
   npm install
   npm run dev
   ```
4. **Make yourself an admin**: after signing up, in Supabase Studio run:
   ```sql
   update profiles set role = 'admin' where id = '<your-user-id>';
   ```
5. **Deploy**: push to GitHub, import into Vercel, add the same env vars in Vercel's project settings.

## Folder structure

```
src/
  app/
    (auth)/login, register          — public auth pages
    (student)/dashboard, lessons,   — authenticated student area
      ai-teacher, topik
    (admin)/admin/...               — role-gated admin dashboard
    api/ai-teacher                  — Claude-backed AI Teacher endpoint
  components/
    ui/        — Button, Card, ProgressRing (design-system primitives)
    layout/    — StudentSidebar, AdminSidebar
    student/   — VideoPlayer, PdfViewer, TopikExamRunner
    admin/     — LessonForm
    ai/        — AiTeacherChat
  lib/
    supabase/  — browser + server + service-role clients
    i18n/      — language registry for future languages
supabase/
  schema.sql   — full DB schema + RLS policies
```
