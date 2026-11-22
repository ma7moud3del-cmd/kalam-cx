/** Wording helpers: counts, durations, languages, price. Keep all user-facing number formats here. */

export const LANG = { ar: 'Arabic', en: 'English', fr: 'French' };

/** "1 video", "3 videos". */
export const plural = (k, w) => `${k} ${w}${k === 1 ? '' : 's'}`;
/** Short duration for cards: "45 min", "5.3 h". */
export const hrs = m => m >= 60 ? `${+(m / 60).toFixed(1)} h` : `${m} min`;
/** Long duration for sentences: "45 minutes", "5.3 hours". */
export const hours = m => m >= 60 ? `${+(m / 60).toFixed(1)} hours` : `${m} minutes`;
/** Clock time for a video position: "4:05", "1:02:09". */
export function clock(sec) {
  const s = Math.max(0, Math.floor(sec)), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}
/** Short language name for a course card ("Arabic"). */
export const langShort = c => c.languageShort || LANG[c.language] || c.languageLabel || '';
/** True when the course costs nothing (every course today). */
export const isFree = c => !+(c.price || 0);
