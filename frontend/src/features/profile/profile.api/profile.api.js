/* features/profile/profile.api/profile.api.js */
import { commit } from "../../../core/store/store";

export function updateProfile(patch) {
  commit((_db, me) => {
    if (patch.username && patch.username.trim().length >= 3) me.username = patch.username.trim();
    if (patch.settings) me.settings = { ...me.settings, ...patch.settings };
  });
}

export function markNotifsRead() {
  commit((_db, me) => { me.notifications.forEach((n) => (n.read = true)); });
}
