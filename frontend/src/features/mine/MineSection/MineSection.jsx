/* ============================================================
   features/mine/MineSection/MineSection.jsx — MINING SCREEN
   ============================================================ */
import { useEffect, useState } from "react";
import { useApp } from "../../../core/AppContext/AppContext";
import { hms, ltc, usd } from "../../../core/format/format";
import * as mine from "../mine.api/mine.api";

export function MineSection() {
  const { user, config, refresh, toast } = useApp();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!user) return null;

  const isMining = !!user.sessionStart;
  const earned = mine.accrued();
  const total = config.sessionHours * 3600e3;
  const elapsed = isMining ? now - user.sessionStart : 0;
  const done = isMining && elapsed >= total;
  const progress = isMining ? Math.min(100, (elapsed / total) * 100) : 0;
  const rate = mine.ratePerHour(config, user.level);
  const maxed = user.level >= config.maxLevel;
  const cost = mine.upgradeCost(config, user.level);

  const onMineClaim = () => {
    try {
      if (!isMining) { mine.start(); toast("info", "Mining started ⛏️"); }
      else { toast("success", `Claimed ${ltc(mine.claim())} LTC 💰`); }
      refresh();
    } catch (e) { toast("error", e.message); }
  };

  const onUpgrade = () => {
    try { toast("success", `Upgraded to level ${mine.upgrade()} ⚡`); refresh(); }
    catch (e) { toast("error", e.message); }
  };

  return (
    <section className="tab-section">
      <header className="app-header">
        <div>
          <p className="bold">Hi, {user.username}</p>
          <span className="badge badge-gold">⚡ Level {user.level}</span>
        </div>
        <span className="avatar">{user.avatar}</span>
      </header>

      {config.announcement && <div className="announce">{config.announcement}</div>}

      <div className="card balance-card">
        <p className="muted small">Total Balance</p>
        <p className="balance">{ltc(user.balance)} <b className="grad">LTC</b></p>
        <p className="muted small">≈ {usd(user.balance, config.ltcUsd)}</p>
      </div>

      <div className="mine-orb-wrap">
        <div className={`mine-orb ${isMining ? "mining" : ""}`}>
          <span className="orb-icon">{done ? "💰" : "⛏️"}</span>
          <p className="orb-amount">{isMining ? `+${ltc(earned)}` : ""}</p>
          <p className="orb-timer muted small">
            {!isMining ? "Miner idle" : done ? "SESSION FULL" : hms(total - elapsed)}
          </p>
        </div>
      </div>

      <div className="progress"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>

      <button className={`btn ${done ? "btn-gold" : "btn-primary"} btn-block btn-lg`} onClick={onMineClaim}>
        {!isMining ? `⚡ Start Mining (${config.sessionHours}h)` : done ? "💰 Claim Full Session" : `Claim ${ltc(earned)} LTC`}
      </button>

      <div className="grid-2">
        <div className="card stat"><p className="muted small">⚡ Hash Rate</p><p className="bold">{ltc(rate)} /h</p></div>
        <div className="card stat"><p className="muted small">🏆 Total Mined</p><p className="bold">{ltc(user.totalMined)} LTC</p></div>
      </div>

      <div className="card row-between">
        <div>
          <p className="bold">Upgrade Rig 🚀</p>
          <p className="muted small">{maxed ? "Max level 🏁" : `Lv.${user.level} → ${user.level + 1} · ${ltc(cost)} LTC`}</p>
        </div>
        <button className="btn btn-gold" onClick={onUpgrade} disabled={maxed}>Upgrade</button>
      </div>
    </section>
  );
}
