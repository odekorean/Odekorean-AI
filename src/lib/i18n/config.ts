// Central registry of interface languages and target learning languages.
// Adding a new target language (English, Japanese, Russian, Chinese) is a
// row in Supabase's `languages` table + an entry here for the UI copy —
// never a code rewrite of lessons/quizzes/AI-teacher/TOPIK logic, since all
// of those tables are already scoped by `language_id`.

export const UI_LOCALES = ["uz", "en", "ru", "ko"] as const;
export type UiLocale = (typeof UI_LOCALES)[number];

export const TARGET_LANGUAGES = [
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", enabled: true },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧", enabled: false },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", enabled: false },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", enabled: false },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", enabled: false },
] as const;

export const DEFAULT_UI_LOCALE: UiLocale = "uz";
export const DEFAULT_TARGET_LANGUAGE_CODE = "ko";

// AI Teacher system prompts are also keyed by target language so the same
// /api/ai-teacher route can serve every language once its prompt is added.
export const AI_TEACHER_PERSONA_NAME: Record<string, string> = {
  ko: "선생님 (Sonsaengnim)",
  ja: "先生 (Sensei)",
  en: "Teacher",
  ru: "Учитель",
  zh: "老师 (Lǎoshī)",
};
