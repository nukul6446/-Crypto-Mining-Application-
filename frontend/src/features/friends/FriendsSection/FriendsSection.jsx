/* features/friends/FriendsSection/FriendsSection.jsx */
import { useApp } from "../../../core/AppContext/AppContext";
import { dateTime, ltc } from "../../../core/format/format";
import * as friends from "../friends.api/friends.api";

export function FriendsSection() {
  const { user, toast } = useApp();
  const info = friends.referralInfo();
  // Friendly placeholder if something hasn't loaded yet.
  if (!user) return <section className="tab-section"><p className="muted">Loading…</p></section>;
  if (!info) return <section className="tab-section"><p className="muted">Loading…</p></section>;

  const copy = async (text, label) => {
    try { await navigator.clipboard.writeText(text); toast("success", `${label} copied 📋`); }
    catch { toast("error", "Copy failed — select manually"); }
  };

  return (
    <section className="tab-section">
      <h2>Invite Friends 👥</h2>

      <div className="card ref-hero">
        <span className="big-emoji">🤝</span>
        <p className="muted small">
          Friends get {ltc(info.signupBonus)} LTC on signup. You earn {info.commissionPct}% of everything they mine — forever.
        </p>
        <div className="ref-code">{info.code}</div>
        <div className="grid-2">
          <button className="btn btn-ghost" onClick={() => copy(info.code, "Code")}>📋 Copy Code</button>
          <button className="btn btn-primary" onClick={() => copy(info.link, "Invite link")}>🔗 Copy Link</button>
        </div>
      </div>

      <div className="grid-2">
        <div className="card stat"><p className="muted small">👥 Referrals</p><p className="bold">{info.team.length}</p></div>
        <div className="card stat"><p className="muted small">💸 Earned</p><p className="bold">{ltc(info.totalEarned)} LTC</p></div>
      </div>

      <h3>Your Team</h3>
      {info.team.length === 0
        ? <p className="empty">🌱 No referrals yet — share your link to start earning!</p>
        : info.team.map((r) => (
            <div key={r.id} className="list-row">
              <div className="ref-avatar">{r.username.slice(0, 1).toUpperCase()}</div>
              <div className="grow">
                <p className="title">{r.username}</p>
                <p className="sub">Joined {dateTime(r.joinedAt)}</p>
              </div>
              <span className="amount-plus">+{ltc(r.earned)}</span>
            </div>
          ))}
    </section>
  );
}
