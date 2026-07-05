/* features/admin/admin.api/admin.api.js */
import { commit, currentUser, loadDB, pushNotif, pushTx } from "../../../core/store/store";

const ensureAdmin = () => {
  const u = currentUser();
  if (!u || !u.isAdmin) throw new Error("Admin access required");
};

export function stats() {
  ensureAdmin();
  const db = loadDB();
  const users = Object.values(db.users);
  return {
    totalUsers: users.length,
    activeMiners: users.filter((u) => u.sessionStart).length,
    totalBalance: users.reduce((s, u) => s + u.balance, 0),
    pendingWithdrawals: db.transactions.filter((t) => t.type === "withdraw" && t.status === "pending").length,
  };
}

export function users() { ensureAdmin(); return Object.values(loadDB().users).sort((a, b) => b.createdAt - a.createdAt); }
export function tasks() { ensureAdmin(); return loadDB().tasks; }

export function toggleBan(userId) {
  ensureAdmin();
  commit((db) => { const u = db.users[userId]; if (u && !u.isAdmin) u.banned = !u.banned; });
}

export function adjustBalance(userId, amount) {
  ensureAdmin();
  commit((db) => {
    const u = db.users[userId];
    if (!u) throw new Error("User not found");
    u.balance = Math.max(0, u.balance + amount);
    pushTx(db, u.id, "admin", amount, "Balance adjustment by admin");
    pushNotif(u, "Balance adjusted", `An admin ${amount >= 0 ? "credited" : "debited"} ${Math.abs(amount).toFixed(6)} LTC.`);
  });
}

export function updateConfig(patch) { ensureAdmin(); commit((db) => { db.config = { ...db.config, ...patch }; }); }
export function toggleTask(taskId) { ensureAdmin(); commit((db) => { const t = db.tasks.find((x) => x.id === taskId); if (t) t.active = !t.active; }); }

export function announce(body) {
  ensureAdmin();
  commit((db) => {
    db.config.announcement = body;
    Object.values(db.users).forEach((u) => pushNotif(u, "📢 Announcement", body));
  });
}
