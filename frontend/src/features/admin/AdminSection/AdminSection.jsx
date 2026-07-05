/* features/admin/AdminSection/AdminSection.jsx */
import { useState } from "react";
import { useApp } from "../../../core/AppContext/AppContext";
import { ltc } from "../../../core/format/format";
import * as admin from "../admin.api/admin.api";

const CONFIG_FIELDS = [
  ["baseRatePerHour", "Base mining rate (LTC/hour)"],
  ["sessionHours", "Session length (hours)"],
  ["referralPct", "Referral commission (%)"],
  ["minWithdraw", "Minimum withdrawal (LTC)"],
  ["withdrawFeePct", "Withdrawal fee (%)"],
  ["ltcUsd", "LTC/USD rate"],
];

export function AdminSection() {
  const { user, config, refresh, toast } = useApp();
  const [form, setForm] = useState(config);
  const [ann, setAnn] = useState("");

  if (!user?.isAdmin) return <div className="card center"><span className="big-emoji">🚫</span><p className="muted">Admin only</p></div>;

  const s = admin.stats();

  const wrap = (fn, ok) => () => { try { fn(); toast("success", ok); refresh(); } catch (e) { toast("error", e.message); } };

  const adjust = (id) => {
    const v = parseFloat(window.prompt("Amount (negative to debit):") || "");
    if (!v || isNaN(v)) return;
    try { admin.adjustBalance(id, v); toast("success", "Balance adjusted"); refresh(); }
    catch (e) { toast("error", e.message); }
  };

  const saveConfig = (e) => { e.preventDefault(); wrap(() => admin.updateConfig(form), "Configuration saved 💾")(); };
  const broadcast = (e) => { e.preventDefault(); if (!ann.trim()) return toast("error", "Message required"); admin.announce(ann.trim()); setAnn(""); toast("success", "Announcement sent 📢"); refresh(); };

  return (
    <section className="tab-section">
      <h2>Admin Panel 🛡️</h2>

      <div className="grid-2">
        <div className="card stat"><p className="muted small">👥 Users</p><p className="bold">{s.totalUsers}</p></div>
        <div className="card stat"><p className="muted small">⛏️ Active miners</p><p className="bold">{s.activeMiners}</p></div>
        <div className="card stat"><p className="muted small">💰 Total balances</p><p className="bold">{ltc(s.totalBalance)}</p></div>
        <div className="card stat"><p className="muted small">📤 Pending</p><p className="bold">{s.pendingWithdrawals}</p></div>
      </div>

      <h3>👥 Users</h3>
      {admin.users().map((u) => (
        <div key={u.id} className="list-row">
          <span style={{ fontSize: 20 }}>{u.avatar}</span>
          <div className="grow">
            <p className="title">{u.username} {u.isAdmin && <span className="badge badge-red">admin</span>} {u.banned && <span className="badge badge-red">banned</span>}</p>
            <p className="sub">Ł {ltc(u.balance)} · Lv.{u.level}</p>
          </div>
          <div className="admin-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => adjust(u.id)}>± Bal</button>
            {!u.isAdmin && <button className="btn btn-danger btn-sm" onClick={wrap(() => admin.toggleBan(u.id), "Ban toggled")}>{u.banned ? "Unban" : "Ban"}</button>}
          </div>
        </div>
      ))}

      <h3>⚙️ Reward Configuration</h3>
      <form className="card" onSubmit={saveConfig}>
        {CONFIG_FIELDS.map(([k, label]) => (
          <div key={k} className="cfg-row">
            <label htmlFor={`cfg-${k}`}>{label}</label>
            <input id={`cfg-${k}`} className="input" type="number" step="any" value={form[k]} onChange={(e) => setForm((p) => ({ ...p, [k]: parseFloat(e.target.value) || 0 }))} />
          </div>
        ))}
        <button className="btn btn-primary btn-block" type="submit">💾 Save Configuration</button>
      </form>

      <h3>✅ Tasks</h3>
      {admin.tasks().map((t) => (
        <div key={t.id} className="list-row">
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <div className="grow"><p className="title">{t.title}</p><p className="task-reward">+{ltc(t.reward)} LTC</p></div>
          <button className={`btn ${t.active ? "btn-primary" : "btn-ghost"} btn-sm`} onClick={wrap(() => admin.toggleTask(t.id), "Task toggled")}>{t.active ? "Active ✓" : "Disabled"}</button>
        </div>
      ))}

      <h3>📢 Announcement</h3>
      <form className="card" onSubmit={broadcast}>
        <textarea className="input" rows={3} placeholder="Message to all users…" value={ann} onChange={(e) => setAnn(e.target.value)} />
        <button className="btn btn-primary btn-block" type="submit">Broadcast</button>
      </form>
    </section>
  );
}