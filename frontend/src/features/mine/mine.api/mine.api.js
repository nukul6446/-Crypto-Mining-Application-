/* ============================================================
   features/mine/mine.api/mine.api.js — MINING LOGIC
   ============================================================ */
import { commit, currentUser, getConfig, pushNotif, pushTx } from "../../../core/store/store";

export const ratePerHour = (cfg, level) =>
  cfg.baseRatePerHour * Math.pow(cfg.levelMultiplier, level - 1);

export const upgradeCost = (cfg, level) =>
  cfg.upgradeBaseCost * Math.pow(2, level - 1);

export function accrued() {
  const u = currentUser();
  const cfg = getConfig();
  if (!u || !u.sessionStart) return 0;
  const cappedMs = Math.min(Date.now() - u.sessionStart, cfg.sessionHours * 3600e3);
  return Math.max(0, (cappedMs / 3600e3) * ratePerHour(cfg, u.level));
}

export function start() {
  commit((_db, me) => {
    if (me.sessionStart) throw new Error("Already mining");
    me.sessionStart = Date.now();
  });
}

export function claim() {
  return commit((db, me) => {
    if (!me.sessionStart) throw new Error("No active session");
    const amount = accrued();
    me.balance += amount;
    me.totalMined += amount;
    me.sessionStart = null;
    pushTx(db, me.id, "mining", amount, `Mining session claimed (Lv.${me.level})`);
    if (me.referredBy && db.users[me.referredBy]) {
      const ref = db.users[me.referredBy];
      const cut = amount * (db.config.referralPct / 100);
      ref.balance += cut;
      ref.referralEarnings += cut;
      const entry = ref.referrals.find((r) => r.id === me.id);
      if (entry) entry.earned += cut;
      pushTx(db, ref.id, "referral", cut, "Commission from " + me.username);
      pushNotif(ref, "Referral bonus 🎉", me.username + " mined — you earned " + cut.toFixed(6) + " LTC.");
    }
    return amount;
  });
}

export function upgrade() {
  return commit((db, me) => {
    if (me.level >= db.config.maxLevel) throw new Error("Max level reached");
    const cost = upgradeCost(db.config, me.level);
    if (me.balance < cost) throw new Error("Insufficient balance to upgrade");
    me.balance -= cost;
    me.level += 1;
    pushTx(db, me.id, "upgrade", -cost, "Miner upgraded to level " + me.level);
    return me.level;
  });
}
