/* features/earn/earn.api/earn.api.js */
import { commit, currentUser, loadDB, pushTx, todayStr } from "../../../core/store/store";

export const CHECKIN_REWARDS = [0.0001, 0.00015, 0.0002, 0.0003, 0.0004, 0.0006, 0.001];
export const getTasks = () => loadDB().tasks.filter((t) => t.active);

export function checkIn() {
  return commit((db, me) => {
    const today = todayStr();
    if (me.lastCheckIn === today) throw new Error("Already checked in today");
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    me.streak = me.lastCheckIn === yesterday ? me.streak + 1 : 1;
    me.lastCheckIn = today;
    const day = ((me.streak - 1) % 7) + 1;
    const reward = CHECKIN_REWARDS[day - 1];
    me.balance += reward;
    pushTx(db, me.id, "checkin", reward, "Daily check-in day " + day);
    return { day, reward };
  });
}

export function startTask(taskId) {
  commit((_db, me) => { if (!me.taskStates[taskId]) me.taskStates[taskId] = "started"; });
}

export function claimTask(taskId) {
  return commit((db, me) => {
    const t = db.tasks.find((x) => x.id === taskId);
    if (!t) throw new Error("Task not found");
    if (me.taskStates[taskId] === "done") throw new Error("Task already claimed");
    if (taskId === "t_inv" && me.referrals.length < 3) throw new Error(`Invite ${3 - me.referrals.length} more friend(s) first`);
    if (taskId === "t_boost" && me.level < 3) throw new Error("Reach miner level 3 first");
    me.taskStates[taskId] = "done";
    me.balance += t.reward;
    pushTx(db, me.id, "task", t.reward, "Task reward: " + t.title);
    return t.reward;
  });
}

export const isCheckedToday = () => {
  const u = currentUser();
  return u ? u.lastCheckIn === todayStr() : false;
};