const tabs = [
  { id: "mine", label: "Mine", icon: "⛏️" },
  { id: "earn", label: "Earn", icon: "🎁" },
  { id: "wallet", label: "Wallet", icon: "💼" },
  { id: "profile", label: "Profile", icon: "👤" },
];
// Props: activeTab = which tab is open, onSelectTab = function to change it.
export function BottomNav({ activeTab, onSelectTab }) {
  return (
    <nav style={styles.nav}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelectTab(t.id)}
          style={{
            ...styles.btn,
            color: activeTab === t.id ? "#2563eb" : "#888",  // highlight active
          }}
        >
          <div>{t.icon}</div>
          <span style={{ fontSize: 11 }}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
// Inline styles keep this step self-contained (real app uses base.css).
const styles = {
  nav: {
    position: "fixed", bottom: 0, left: 0, right: 0,
    display: "flex", background: "#fff", borderTop: "1px solid #e3e6ea",
  },
  btn: {
    flex: 1, border: "none", background: "none", cursor: "pointer",
    padding: "10px 0", fontSize: 18,
  },
};
 