import styles from "./PublicBrandMark.module.css";

export default function PublicBrandMark({ inverse = false }: { inverse?: boolean }) {
  return <span className={`${styles.brand} ${inverse ? styles.inverse : ""}`}>
    <svg className={styles.symbol} viewBox="0 0 52 62" aria-hidden="true">
      <path d="M26 2 5 47h42L26 2Z" strokeWidth="2.4"/>
      <path d="M26 2v45M12 31h28M17 20l9 11 9-11M5 47l21 13 21-13M18 47l8 13 8-13" strokeWidth="2.1"/>
      <path d="M11 47h30" strokeWidth="2.4"/>
    </svg>
    <span className={styles.wordmark}>
      <strong>LICOGI18.3</strong>
      <span>TỔNG THẦU XÂY DỰNG</span>
    </span>
  </span>;
}
