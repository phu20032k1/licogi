"use client";

import { useCallback, useEffect, useState } from "react";

export type PublicLanguage = "vi" | "en" | "ja" | "ko" | "zh";

export const PUBLIC_LANGUAGES: Array<{ code: PublicLanguage; short: string; label: string; flag: string }> = [
  { code: "vi", short: "VI", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", short: "EN", label: "English", flag: "🇬🇧" },
  { code: "ja", short: "JA", label: "日本語", flag: "🇯🇵" },
  { code: "ko", short: "KO", label: "한국어", flag: "🇰🇷" },
  { code: "zh", short: "ZH", label: "中文", flag: "🇨🇳" },
];

const STORAGE_KEY = "licogi-public-language";
const EVENT_NAME = "licogi-public-language-change";

function isPublicLanguage(value: string | null): value is PublicLanguage {
  return value === "vi" || value === "en" || value === "ja" || value === "ko" || value === "zh";
}

export default function usePublicLanguage() {
  const [language, setLanguageState] = useState<PublicLanguage>("vi");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isPublicLanguage(stored)) {
      setLanguageState(stored);
      document.documentElement.lang = stored;
    }

    const onLanguageChange = (event: Event) => {
      const code = (event as CustomEvent<PublicLanguage>).detail;
      if (!isPublicLanguage(code)) return;
      setLanguageState(code);
      document.documentElement.lang = code;
    };

    window.addEventListener(EVENT_NAME, onLanguageChange);
    return () => window.removeEventListener(EVENT_NAME, onLanguageChange);
  }, []);

  const setLanguage = useCallback((code: PublicLanguage) => {
    setLanguageState(code);
    window.localStorage.setItem(STORAGE_KEY, code);
    document.documentElement.lang = code;
    window.dispatchEvent(new CustomEvent<PublicLanguage>(EVENT_NAME, { detail: code }));
  }, []);

  return { language, setLanguage };
}
