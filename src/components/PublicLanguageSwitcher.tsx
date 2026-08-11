"use client";

import { Check, ChevronDown, Languages } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import usePublicLanguage, { PUBLIC_LANGUAGES, PublicLanguage } from "../hooks/usePublicLanguage";
import styles from "./PublicLanguageSwitcher.module.css";

export default function PublicLanguageSwitcher() {
  const { language, setLanguage } = usePublicLanguage();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = PUBLIC_LANGUAGES.find((item) => item.code === language) || PUBLIC_LANGUAGES[0];

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const choose = (code: PublicLanguage) => {
    setLanguage(code);
    setOpen(false);
  };

  return <div className={styles.wrap} ref={rootRef}>
    <button type="button" className={styles.trigger} onClick={() => setOpen((value) => !value)} aria-haspopup="listbox" aria-expanded={open} aria-label="Chọn ngôn ngữ">
      <Languages size={15}/>
      <span className={styles.flag}>{selected.flag}</span>
      <span>{selected.short}</span>
      <ChevronDown size={13}/>
    </button>
    {open ? <div className={styles.menu} role="listbox" aria-label="Ngôn ngữ website">
      {PUBLIC_LANGUAGES.map((item) => <button
        key={item.code}
        type="button"
        role="option"
        aria-selected={language === item.code}
        className={`${styles.option} ${language === item.code ? styles.optionActive : ""}`}
        onClick={() => choose(item.code)}
      >
        <span className={styles.flag}>{item.flag}</span>
        <strong>{item.label}</strong>
        {language === item.code ? <Check size={14} className={styles.check}/> : <small>{item.short}</small>}
      </button>)}
    </div> : null}
  </div>;
}
