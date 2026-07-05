/* features/earn/EarnSection/EarnSection.jsx */
import { useApp } from "../../../core/AppContext/AppContext";
import { ltc } from "../../../core/format/format";
import { todayStr } from "../../../core/store/store";
import * as earn from "../earn.api/earn.api";

export function EarnSection() {
  const { user, refresh, toast } = useApp();
  if (!user) return null;

  const tasks = earn.getTasks();
  const claimedToday = user.lastCheckIn === todayStr();
  const currentDay = user.streak === 0 ? 0 : ((user.streak - 1) % 7) + 1;
  const nextDay = claimedToday ? currentDay : (currentDay % 7) + 1;

  const onCheckIn = () => {
    try {
      const { day, reward } = earn.checkIn();
      toast("success", `Day ${day} check-in: +${ltc(reward)} LTC 🎁`);
      refresh();
    } catch (e) { toast("error", e.message); }
  };

  const onTask = (t, action) => {
    try {
      if (action === "go") {
        if (t.url) window.open(t.url, "_blank");
        earn.startTask(t.id);
        toast("info", "Task started — come back and Claim!");
      } else {
        toast("success", `Task complete: +${ltc(earn.claimTask(t.id))} LTC ✅`);
      }
      refresh();
    } catch (e) { toast("error", e.message); }
  };

  return (
    <section className="tab-section">
      <h2>Earn Rewards 🎁</h2>

      <div className="card">
        <div className="row-between">
          <p className="bold">Daily Check-in</p>
          <span className="badge badge-gold">🔥 {user.streak} day{user.streak === 1 ? "" : "s"}</span>
        </div>
        <div className="checkin-grid">
          {earn.CHECKIN_REWARDS.map((r, i) => {
            const day = i + 1;
            const cls = day <= currentDay ? "claimed" : (!claimedToday && day === nextDay ? "next" : "");
            return (
              <div key={day} className={`checkin-day ${cls}`}>
                <span className="d">D{day}</span>
                <span>{day <= currentDay ? "✅" : day === 7 ? "🎁" : "🪙"}</span>
                <span className="r">{(r * 1000).toFixed(2)}m</span>
              </div>
            );
          })}
        </div>
        <button className="btn btn-primary btn-block" onClick={onCheckIn} disabled={claimedToday}>
          {claimedToday ? "Come back tomorrow ⏰" : `Claim Day ${nextDay} — ${ltc(earn.CHECKIN_REWARDS[nextDay - 1])} LTC`}
        </button>
      </div>

      <h3>Tasks & Achievements</h3>
      {tasks.map((t) => {
        const state = user.taskStates[t.id];
        return (
          <div key={t.id} className="list-row">
            <div className="task-icon">{t.icon}</div>
            <div className="grow">
              <p className="title">{t.title}</p>
              <p className="sub">{t.desc}</p>
              <p className="task-reward">+{ltc(t.reward)} LTC</p>
            </div>
            {state === "done" ? (
              <span className="badge badge-green">Done ✓</span>
            ) : state === "started" || !t.url ? (
              <button className="btn btn-gold btn-sm" onClick={() => onTask(t, "claim")}>Claim</button>
            ) : (
              <button className="btn btn-ghost btn-sm" onClick={() => onTask(t, "go")}>Go →</button>
            )}
          </div>
        );
      })}
    </section>
  );
}