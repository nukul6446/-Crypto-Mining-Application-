/* ============================================================
   components/BottomNav/BottomNav.jsx — shared tab bar
   ============================================================ */
import { useApp } from "../../core/AppContext/AppContext";

export function BottomNav({ activeTab, onSelectTab }) {
  const { user } = useApp();
  const tabs = [
    { id: "mine", label: "Mine", icon: "⛏️" },
    { id: "earn", label: "Earn", icon: "🎁" },
    { id: "friends", label: "Friends", icon: "👥" },
    { id: "wallet", label: "Wallet", icon: "💼" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];
  if (user?.isAdmin) tabs.push({ id: "admin", label: "Admin", icon: "🛡️" });

  return (
    <nav id="bottom-nav">
      {tabs.map((t) => (
        <button key={t.id} className={`nav-btn ${activeTab === t.id ? "active" : ""}`} onClick={() => onSelectTab(t.id)} type="button">
          {t.icon}<span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}