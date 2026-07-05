/* ============================================================
   core/AppContext/AppContext.jsx — GLOBAL STATE + TOAST + AUTH
   ============================================================ */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast as toastify } from "react-toastify";
import {
  clearToken, currentUser, getConfig, hash, loadDB,
  makeJwt, makeUser, pushNotif, pushTx, saveDB, setToken,
} from "../store/store";

const AppContext = createContext(null);
export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => currentUser());
  const [config, setConfig] = useState(() => getConfig());

  const refresh = useCallback(() => {
    setUser(currentUser());
    setConfig(getConfig());
  }, []);

  const toast = useCallback((kind, text) => {
    if (kind === "success") toastify.success(text);
    else if (kind === "error") toastify.error(text);
    else toastify.info(text);
  }, []);

  const login = useCallback((email, pass) => {
    const db = loadDB();
    const u = Object.values(db.users).find((x) => x.email === email.trim().toLowerCase());
    if (!u || u.passHash !== hash(pass)) throw new Error("Invalid email or password");
    if (u.banned) throw new Error("This account has been suspended");
    setToken(makeJwt(u.id));
    refresh();
  }, [refresh]);

  const register = useCallback((username, email, pass, refCode) => {
    const cleanEmail = email.trim().toLowerCase();
    if (username.trim().length < 3) throw new Error("Username must be at least 3 characters");
    if (!/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(cleanEmail)) throw new Error("Invalid email address");
    if (pass.length < 6) throw new Error("Password must be at least 6 characters");

    const db = loadDB();
    if (Object.values(db.users).some((u) => u.email === cleanEmail)) throw new Error("Email already registered");

    let referrer = null;
    if (refCode) {
      referrer = Object.values(db.users).find((u) => u.referralCode === refCode.trim().toUpperCase());
      if (!referrer) throw new Error("Invalid referral code");
    }
    const u = makeUser({ username: username.trim(), email: cleanEmail, passHash: hash(pass), referredBy: referrer ? referrer.id : null });
    if (referrer) {
      u.balance += db.config.referralBonus;
      pushTx(db, u.id, "referral", db.config.referralBonus, "Signup bonus (invited by " + referrer.username + ")");
      referrer.referrals.push({ id: u.id, username: u.username, joinedAt: Date.now(), earned: 0 });
      pushNotif(referrer, "New referral 🎉", u.username + " joined with your code!");
    }
    pushNotif(u, "Welcome to LitMiner ⛏️", "Start mining and claim your daily reward!");
    db.users[u.id] = u;
    saveDB(db);
    setToken(makeJwt(u.id));
    refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    toast("info", "Logged out — see you soon 👋");
  }, [toast]);

  useEffect(() => {
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [refresh]);

  return (
    <AppContext.Provider value={{ user, config, refresh, toast, login, register, logout }}>
      {children}
    </AppContext.Provider>
  );
}
