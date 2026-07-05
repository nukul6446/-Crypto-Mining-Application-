/* features/wallet/WalletSection/WalletSection.jsx */
import { useState } from "react";
import { useApp } from "../../../core/AppContext/AppContext";
import { dateTime, ltc, usd } from "../../../core/format/format";
import * as wallet from "../wallet.api/wallet.api";

const ICON = { mining: "⛏️", referral: "👥", task: "✅", checkin: "📅", withdraw: "📤", deposit: "📥", upgrade: "⚡", admin: "🛡️" };

export function WalletSection() {
  const { user, config, refresh, toast } = useApp();
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  if (!user) return null;

  const txs = wallet.history();

  const onWithdraw = (e) => {
    e.preventDefault();
    try {
      wallet.withdraw(address, parseFloat(amount) || 0);
      toast("success", "Withdrawal submitted ⏳");
      setAddress(""); setAmount("");
      refresh();
    } catch (err) { toast("error", err.message); }
  };

  const onDeposit = () => { wallet.deposit(0.01); toast("success", "Deposited 0.010000 LTC (demo) 📥"); refresh(); };

  return (
    <section className="tab-section">
      <h2>Wallet 💼</h2>

      <div className="card balance-card">
        <p className="muted small">Available Balance</p>
        <p className="balance">{ltc(user.balance)} <b className="grad">LTC</b></p>
        <p className="muted small">≈ {usd(user.balance, config.ltcUsd)}</p>
      </div>

      <form className="card" onSubmit={onWithdraw}>
        <p className="bold">📤 Withdraw</p>
        <input className="input" placeholder="LTC address (ltc1q...)" value={address} onChange={(e) => setAddress(e.target.value)} />
        <input className="input" type="number" step="0.0001" placeholder="Amount (LTC)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <p className="muted small">Min {config.minWithdraw} LTC · Fee {config.withdrawFeePct}%</p>
        <button className="btn btn-primary btn-block" type="submit">Confirm Withdrawal</button>
      </form>

      <div className="card row-between">
        <div><p className="bold">📥 Deposit</p><p className="muted small">Demo: adds 0.01 LTC</p></div>
        <button className="btn btn-ghost" onClick={onDeposit}>Deposit</button>
      </div>

      <h3>Transaction History</h3>
      {txs.length === 0
        ? <p className="empty">🧾 No transactions yet</p>
        : txs.map((t) => (
            <div key={t.id} className="list-row">
              <div className="tx-icon">{ICON[t.type] || "🧾"}</div>
              <div className="grow">
                <p className="title">{t.type}{t.status !== "completed" && <span className={`tx-status tx-${t.status}`}> {t.status}</span>}</p>
                <p className="sub">{t.note}</p>
                <p className="sub">{dateTime(t.createdAt)}</p>
              </div>
              <span className={t.amount >= 0 ? "amount-plus" : "amount-minus"}>{t.amount >= 0 ? "+" : ""}{ltc(t.amount)}</span>
            </div>
          ))}
    </section>
  );
}