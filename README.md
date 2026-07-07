# (LitMiner — Frontend ↔ Backend Architecture)
--------------------------------------------------------------------------------------------
# ⛏️ LitMiner — Crypto Mining App

A Telegram-mini-app-style crypto mining application with a **React frontend**
(`src/`) and a **Node.js + Express + MongoDB backend** (`backend/`) that also
serves **EJS server-rendered pages** for classic URL routing.

> 🎓 Structured for learning: every file sits in its own named folder
> following the `name/name.<ext>` rule, and the same UI recipe is repeated
> across every screen.

---

## 1. 🚀 Project Setup

### Frontend (works offline)
 
npm install
npm run dev      # open the printed localhost URL
npm run build    # production build → dist/
 

### Backend (the real server)
 
cd backend
npm install
cp .env.example .env          # fill in MONGO_URI + JWT_SECRET
node server.js                # → ⛏️ LitMiner API on http://localhost:5000
 

Then:
- **http://localhost:5000/mining** → EJS server-rendered mining page
- **http://localhost:5000/api/mining/status** → JSON API
- **http://localhost:5173** (from `npm run dev`) → the React frontend

### Demo Accounts
| Role  | Email              | Password |
|-------|--------------------|----------|
| User  | demo@litminer.app  | demo123  |
| Admin | admin@litminer.app | admin123 |

---

## 2. 📁 Folder Structure

litminer/
├── src/                                ← THE FRONTEND (Vite, plain .jsx, no TypeScript)
│   ├── App/                            ← shell: auth gate + tab routing
│   ├── main/                           ← entry point
│   ├── index/                          ← the CSS root (imports every section's CSS)
│   ├── core/                           ← shared plumbing used by every feature
│   │   ├── store/store.js              ←   localStorage "database" + commit/pushTx
│   │   ├── AppContext/AppContext.jsx   ←   useApp() → user, refresh, toast, login…
│   │   └── format/format.js            ←   ltc(), usd(), hms(), dateTime(), ago()
│   ├── components/                     ← shared UI
│   │   └── BottomNav/BottomNav.jsx     ←   the bottom tab bar
│   ├── features/                       ← one folder per screen (self-contained)
│   │   ├── auth/AuthSection/           ←   login + register
│   │   ├── mine/MineSection/           ←   mining orb, claim, upgrade
│   │   │   └── mine.api/mine.api.js    ←     the logic (start, claim, upgrade)
│   │   ├── earn/EarnSection/           ←   daily check-in + tasks
│   │   │   └── earn.api/earn.api.js
│   │   ├── friends/FriendsSection/     ←   referral code + team
│   │   │   └── friends.api/friends.api.js
│   │   ├── wallet/WalletSection/       ←   balance + withdraw + history
│   │   │   └── wallet.api/wallet.api.js
│   │   ├── profile/ProfileSection/     ←   settings + notifications + logout
│   │   │   └── profile.api/profile.api.js
│   │   └── admin/AdminSection/         ←   admin panel (admins only)
│   │       └── admin.api/admin.api.js
│   └── styles/                         ← one folder per screen
│
├── backend/                            ← THE BACKEND (Node + Express + MongoDB + EJS)
│   ├── server.js                       ← entry: CORS, EJS, routes
│   ├── package.json
│   ├── .env.example
│   ├── config/db.js                    ← mongoose.connect()
│   ├── models/                         ← Mongoose schemas
│   │   ├── User.js  Transaction.js  Task.js  Setting.js
│   ├── middleware/auth.js              ← protect() + adminOnly() JWT guards
│   ├── routes/                         ← JSON API + EJS page routes
│   │   ├── auth.js  user.js  mining.js  wallet.js
│   │   ├── reward.js  task.js  referral.js  admin.js
│   │   └── pages.js                    ←   EJS page routes (res.render)
│   ├── views/                          ← EJS templates + partials
│   │   ├── partials/{head,nav,foot}.ejs
│   │   └── auth.ejs mining.ejs earn.ejs friends.ejs wallet.ejs profile.ejs admin.ejs
│   └── public/style.css                ← shared CSS for the EJS pages
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts


---

## 3. 🧠 The One Recipe Every Screen Follows

`js
const { user, refresh, toast } = useApp();   // ① get state + tools

const onClick = () => {
  try {
    featureApi.doThing(...);                 // ② do the action
    toast("success", "Claimed 0.005 LTC");   // ③ tell the user
    refresh();                                // ④ re-read state so the UI updates
  } catch (e) {
    toast("error", e.message);               // errors become red toasts
  }
};


`featureApi.doThing()` is `commit(...)` for the offline simulation, or
`fetch(...)` when wired to the real backend — the recipe is identical.

---

## 4. 🔌 API Documentation

| Method | Endpoint | Auth | Action |
|---|---|---|---|
| `POST` | `/api/auth/register` | — | register (+ referral bonus) |
| `POST` | `/api/auth/login` | — | login & return 7-day JWT |
| `GET`  | `/api/users/me` | JWT | profile + balances |
| `PATCH`| `/api/users/me` | JWT | update username / settings |
| `POST` | `/api/mining/start` / `/claim` / `/upgrade` | JWT | mining actions |
| `GET`  | `/api/mining/status` | JWT | live session info |
| `GET`  | `/api/wallet` / `/wallet/transactions` | JWT | balance + history |
| `POST` | `/api/wallet/withdraw` | JWT | withdrawal request |
| `GET`  | `/api/referrals` | JWT | code, link, team, earnings |
| `POST` | `/api/rewards/checkin` | JWT | daily streak reward |
| `GET`  | `/api/tasks` | JWT | active tasks + user status |
| `POST` | `/api/tasks/:id/start` / `/:id/claim` | JWT | task actions |
| `GET/POST/PATCH` | `/api/admin/...` | JWT+admin | stats, users, ban, balance, config, tasks, announce |

**Plus the EJS page routes:** `GET /`, `/mining`, `/earn`, `/friends`, `/wallet`, `/profile`, `/admin` (server-rendered HTML).

Import `docs/LitMiner.postman_collection.json` into Postman to test all endpoints.

---

## 5. 🗄️ Database Schema (Mongoose)

| Collection | Model | Key fields |
|---|---|---|
| `users` | `User.js` | identity, passHash (bcrypt), balance, level, sessionStart, streak, taskStates, referralCode/referredBy, notifications, settings |
| `transactions` | `Transaction.js` | type, amount, status, note (full audit trail) |
| `tasks` | `Task.js` | title, desc, icon, reward, url, active |
| `settings` | `Setting.js` | singleton: mining rates, fees, referral %, announcement |

**Golden rule:** never change a balance without inserting a transaction row in the same `commit(...)`.

 

---

 
