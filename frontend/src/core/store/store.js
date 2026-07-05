/* ============================================================
   core/store/store.js — THE SHARED DATA LAYER (used by every feature)
    ============================================================ */

const DB_KEY = "litminer_db";
const TOKEN_KEY = "litminer_token";

/* ---- tiny utilities ---- */
export const uid = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const hash = (s) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return "h_" + h.toString(16);
};

export const todayStr = () => new Date().toISOString().slice(0, 10);

/* ---- config every feature can read ---- */
export const DEFAULT_CONFIG = {
  baseRatePerHour: 0.00125,
  levelMultiplier: 1.5,
  sessionHours: 4,
  referralPct: 10,
  referralBonus: 0.0005,
  minWithdraw: 0.005,
  withdrawFeePct: 1,
  ltcUsd: 84.6,
  upgradeBaseCost: 0.002,
  maxLevel: 10,
  announcement:
    "🚀 Welcome to LitMiner! Invite friends and earn 10% commission forever.",
};

export const DEFAULT_TASKS = [
  { id: "t_tg", title: "Join Telegram Channel", desc: "Official announcements", icon: "✈️", reward: 0.0004, url: "https://t.me/", active: true },
  { id: "t_x",  title: "Follow on X (Twitter)", desc: "Follow @litminer",       icon: "🐦", reward: 0.0003, url: "https://x.com/", active: true },
  { id: "t_yt", title: "Subscribe on YouTube",  desc: "Watch & subscribe",      icon: "▶️", reward: 0.0003, url: "https://youtube.com/", active: true },
  { id: "t_inv",  title: "Invite 3 Friends",    desc: "Bring 3 friends",        icon: "👥", reward: 0.001,  url: "", active: true },
  { id: "t_boost",title: "Reach Miner Level 3", desc: "Upgrade your rig",       icon: "⚡", reward: 0.0008, url: "", active: true },
];

/* ---- factory: one user document (all features' fields live here) ---- */
export const makeUser = (extra) => ({
  id: uid(),
  avatar: "⛏️",
  isAdmin: false,
  banned: false,
  createdAt: Date.now(),
  balance: 0, totalMined: 0, totalWithdrawn: 0,
  level: 1, sessionStart: null,
  streak: 0, lastCheckIn: null, taskStates: {},
  referralCode:
    (extra.username || "user").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6) +
    Math.floor(1000 + Math.random() * 9000),
  referredBy: null, referrals: [], referralEarnings: 0,
  notifications: [],
  settings: { notifications: true, sound: true },
  ...extra,
});

/* ---- seed demo data the first time ---- */
function seed() {
  const db = { users: {}, transactions: [], tasks: DEFAULT_TASKS, config: { ...DEFAULT_CONFIG } };

  const admin = makeUser({
    username: "admin", email: "admin@litminer.app", passHash: hash("admin123"),
    isAdmin: true, avatar: "🛡️", balance: 1.25, totalMined: 3.4, level: 10, referralCode: "ADMIN0001",
  });
  const demo = makeUser({
    username: "satoshi_lite", email: "demo@litminer.app", passHash: hash("demo123"),
    avatar: "🦊", balance: 0.042318, totalMined: 0.0861, totalWithdrawn: 0.03,
    level: 3, streak: 4, referralEarnings: 0.00412,
    taskStates: { t_tg: "done", t_x: "done" }, referralCode: "SATOSH1234",
    createdAt: Date.now() - 32 * 864e5,
  });
  demo.referrals = [
    { id: uid(), username: "crypto_kate", joinedAt: Date.now() - 20 * 864e5, earned: 0.00181 },
    { id: uid(), username: "hodl_mike",   joinedAt: Date.now() - 14 * 864e5, earned: 0.00126 },
  ];
  demo.notifications = [
    { id: uid(), title: "Referral bonus 🎉", body: "crypto_kate claimed rewards — you earned 0.00021 LTC.", read: false, createdAt: Date.now() - 5 * 3600e3 },
    { id: uid(), title: "Welcome to LitMiner ⛏️", body: "Start mining and claim daily rewards!", read: false, createdAt: Date.now() - 31 * 864e5 },
  ];
  db.users[admin.id] = admin;
  db.users[demo.id] = demo;

  [["crypto_kate","🐱",0.018,2],["hodl_mike","🐻",0.007,1],["moon_rider","🚀",0.031,4]]
    .forEach(([name, av, bal, lvl], i) => {
      const u = makeUser({
        username: name, email: name + "@mail.com", passHash: hash("pass123"),
        avatar: av, balance: bal, totalMined: bal * 2, level: lvl,
        referralCode: name.slice(0, 5).toUpperCase() + (1000 + i),
        referredBy: i < 2 ? demo.id : null, createdAt: Date.now() - (20 - i * 5) * 864e5,
      });
      db.users[u.id] = u;
    });

  [
    ["mining", 0.0051, "Mining session claimed (Lv.3)", 6],
    ["referral", 0.00021, "Commission from crypto_kate", 7],
    ["checkin", 0.0003, "Daily check-in day 4", 26],
    ["withdraw", -0.03, "Withdrawal to Lxk2...9fQz", 50],
    ["task", 0.0004, "Task reward: Join Telegram", 70],
    ["upgrade", -0.0045, "Miner upgraded to level 3", 120],
  ].forEach(([type, amount, note, hoursAgo]) => {
    db.transactions.push({
      id: uid(), userId: demo.id, type, amount, note,
      status: type === "withdraw" ? "pending" : "completed",
      createdAt: Date.now() - hoursAgo * 3600e3,
    });
  });
  return db;
}

/* ---- load / save ---- */
export function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted → reseed */ }
  const db = seed();
  saveDB(db);
  return db;
}
export const saveDB = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));

/* ---- token (session) ---- */
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const makeJwt = (userId) =>
  btoa(JSON.stringify({ alg: "HS256" })) + "." +
  btoa(JSON.stringify({ sub: userId, exp: Date.now() + 7 * 864e5 })) + "." + uid();

const userIdFromToken = () => {
  const t = getToken();
  if (!t) return null;
  try {
    const p = JSON.parse(atob(t.split(".")[1]));
    if (p.exp < Date.now()) { clearToken(); return null; }
    return p.sub;
  } catch { return null; }
};

/* THE HELPERS FEATURES ACTUALLY USE */
export function currentUser() {
  const db = loadDB();
  const id = userIdFromToken();
  return id ? db.users[id] || null : null;
}
export const getConfig = () => loadDB().config;

export function commit(fn) {
  const db = loadDB();
  const id = userIdFromToken();
  const me = id ? db.users[id] : null;
  const result = fn(db, me);
  saveDB(db);
  return result;
}
export const pushTx = (db, userId, type, amount, note, status = "completed") =>
  db.transactions.unshift({ id: uid(), userId, type, amount, note, status, createdAt: Date.now() });
export const pushNotif = (user, title, body) =>
  user.notifications.unshift({ id: uid(), title, body, read: false, createdAt: Date.now() });
