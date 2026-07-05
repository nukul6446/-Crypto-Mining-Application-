/* ============================================================
   App/App.jsx — SHELL: auth gate + tab routing
   ============================================================ */
import { useEffect, useState } from "react";

import { AppProvider, useApp } from "../core/AppContext/AppContext";
import { BottomNav } from "../components/BottomNav/BottomNav";

import { AuthSection } from "../features/auth/AuthSection/AuthSection";
import { MineSection } from "../features/mine/MineSection/MineSection";
import { EarnSection } from "../features/earn/EarnSection/EarnSection";
import { FriendsSection } from "../features/friends/FriendsSection/FriendsSection";
import { WalletSection } from "../features/wallet/WalletSection/WalletSection";
import { ProfileSection } from "../features/profile/ProfileSection/ProfileSection";
import { AdminSection } from "../features/admin/AdminSection/AdminSection";

function Shell() {
  const { user, logout } = useApp();
  const [tab, setTab] = useState("mine");
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { if (tab === "admin" && !user?.isAdmin) setTab("mine"); }, [tab, user]);

  if (booting) {
    return (
      <section className="center-screen">
        <div className="logo-box">⛏️</div>
        <h1 className="logo-text">Lit<span className="grad">Miner</span></h1>
        <p className="muted">Connecting…</p>
        <div className="spinner" />
      </section>
    );
  }

  if (!user) return <AuthSection />;

  if (user.banned) {
    return (
      <section className="center-screen">
        <span className="big-emoji">🚫</span>
        <h1 className="logo-text">Account Suspended</h1>
        <p className="muted">Contact support@litminer.app.</p>
        <button className="btn btn-ghost" onClick={logout}>Log Out</button>
      </section>
    );
  }

  return (
    <div id="app">
      <main id="app-main">
        {tab === "mine" && <MineSection />}
        {tab === "earn" && <EarnSection />}
        {tab === "friends" && <FriendsSection />}
        {tab === "wallet" && <WalletSection />}
        {tab === "profile" && <ProfileSection />}
        {tab === "admin" && <AdminSection />}
      </main>
      <BottomNav activeTab={tab} onSelectTab={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
