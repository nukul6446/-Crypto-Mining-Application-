/* ============================================================
   core/format/format.js — SHARED DISPLAY HELPERS
   ============================================================ */

export const ltc = (n, digits = 6) =>
  Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const usd = (n, rate) =>
  "$" + (n * rate).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const hms = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const p = (x) => String(x).padStart(2, "0");
  return p(Math.floor(s / 3600)) + ":" + p(Math.floor((s % 3600) / 60)) + ":" + p(s % 60);
};

export const dateTime = (t) =>
  new Date(t).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export const ago = (t) => {
  const m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.floor(m / 60)}h ago`;
  return `${Math.floor(m / 1440)}d ago`;
};
