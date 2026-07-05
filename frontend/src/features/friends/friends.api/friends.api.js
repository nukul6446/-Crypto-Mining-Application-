/* features/friends/friends.api/friends.api.js */
import { currentUser, getConfig } from "../../../core/store/store";

export const referralInfo = () => {
  const u = currentUser();
  const cfg = getConfig();
  if (!u) return null;
  return {
    code: u.referralCode,
    link: `https://litminer.app/r/${u.referralCode}`,
    commissionPct: cfg.referralPct,
    signupBonus: cfg.referralBonus,
    totalEarned: u.referralEarnings,
    team: u.referrals,
  };
};
