/* features/profile/ProfileSection/ProfileSection.jsx */
import { useEffect } from "react";
import { useApp } from "../../../core/AppContext/AppContext";
import { ago } from "../../../core/format/format";
import * as profile from "../profile.api/profile.api";

export function ProfileSection() {
  const { user, refresh, logout, toast } = useApp();

  useEffect(() => {
    if (user && user.notifications.some((n) => !n.read)) {
      profile.markNotifsRead();
      refresh();
    }
  }, [user, refresh]);

  if (!user) return null;

  const editName = () => {
    const name = window.prompt("New username (min 3 chars):", user.username);
    if (!name) return;
    if (name.trim().length < 3) return toast("error", "Username too short");
    profile.updateProfile({ username: name });
    toast("success", "Username updated");
    refresh();
  };

  const toggle = (key, checked) => {
    profile.updateProfile({ settings: { [key]: checked } });
    toast("info", `${key === "notifications" ? "Notifications" : "Sound"} ${checked ? "on" : "off"}`);
    refresh();
  };

  return (
    <section className="tab-section">
      <div className="card center">
        <span className="avatar avatar-lg">{user.avatar}</span>
        <p className="bold">{user.username}{user.isAdmin ? " 🛡️" : ""}</p>
        <p className="muted small">{user.email}</p>
        <p className="muted small">Level {user.level} · Code {user.referralCode}</p>
        <button className="btn btn-ghost btn-block" onClick={editName}>✏️ Edit Username</button>
      </div>

      <div className="card">
        <p className="bold">Settings ⚙️</p>
        <label className="row-between setting-row">
          <span>Push notifications</span>
          <input type="checkbox" className="switch" checked={user.settings.notifications} onChange={(e) => toggle("notifications", e.target.checked)} />
        </label>
        <label className="row-between setting-row">
          <span>Sound effects</span>
          <input type="checkbox" className="switch" checked={user.settings.sound} onChange={(e) => toggle("sound", e.target.checked)} />
        </label>
      </div>

      <h3>Notifications 🔔</h3>
      {user.notifications.length === 0
        ? <p className="empty">🔕 No notifications</p>
        : user.notifications.map((n) => (
            <div key={n.id} className={`list-row ${n.read ? "" : "notif-unread"}`}>
              <div className="grow">
                <p className="title">{n.title}</p>
                <p className="sub">{n.body}</p>
              </div>
              <span className="sub">{ago(n.createdAt)}</span>
            </div>
          ))}

      <button className="btn btn-danger btn-block" onClick={logout}>🚪 Log Out</button>
      <p className="muted small center">LitMiner · feature-folder build</p>
    </section>
  );
}
