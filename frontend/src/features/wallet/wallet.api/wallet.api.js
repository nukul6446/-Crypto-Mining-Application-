/* features/wallet/wallet.api/wallet.api.js */
import { commit, currentUser, loadDB, pushNotif, pushTx } from "../../../core/store/store";

export function withdraw(address, amount) {
  commit((db, me) => {
    if (!address || address.length < 20) throw new Error("Enter a valid LTC address");
    if (!(amount > 0)) throw new Error("Enter a valid amount");
    if (amount < db.config.minWithdraw) throw new Error(`Minimum withdrawal is ${db.config.minWithdraw} LTC`);
    if (amount > me.balance) throw new Error("Insufficient balance");
    const fee = amount * (db.config.withdrawFeePct / 100);
    me.balance -= amount;
    me.totalWithdrawn += amount;
    pushTx(db, me.id, "withdraw", -amount, `Withdrawal to ${address.slice(0, 6)}...${address.slice(-4)} (fee ${fee.toFixed(6)})`, "pending");
    pushNotif(me, "Withdrawal submitted ⏳", `${amount.toFixed(6)} LTC is being processed.`);
  });
}

export function deposit(amount) {
  commit((db, me) => {
    me.balance += amount;
    pushTx(db, me.id, "deposit", amount, "Deposit received (demo)");
  });
}

export function history() {
  const u = currentUser();
  if (!u) return [];
  return loadDB().transactions.filter((t) => t.userId === u.id);
}
