/**
 * When an incoming rematch request may be shown (D32, user 2026-10-22: "약간 딜레이 주던가").
 *
 * A win that unlocks an achievement brings Play Games' own popup ("업적을 달성했습니다")
 * down over the top of the screen. Google draws it above the app and decides where; on
 * the Flip5 it was a 1080×270 window at the top for 4.1 s, 5.1 s after the unlock was
 * asked for (logcat, 2026-10-22). A rematch asked for in those seconds put its banner
 * under it: the buttons showed, who was asking and how long was left did not.
 *
 * So the banner waits the popup out — only after a win that unlocked something, so
 * every other rematch still shows at once — and counts down from what is left of the
 * asker's 15 seconds, not from a fresh 15: the asker's button comes back when theirs
 * runs out, and a banner still counting then would accept into a match they gave up on.
 */
export const REMATCH_SECONDS = 15;
export const ACHIEVEMENT_POPUP_MS = 5500;

/** How long to hold a request that arrives at `now`, and the seconds its banner starts from. */
export function rematchBannerTiming(popupUntil, now = Date.now()) {
  const waitMs = Math.max(0, (Number(popupUntil) || 0) - now);
  return { waitMs, seconds: Math.max(1, REMATCH_SECONDS - Math.ceil(waitMs / 1000)) };
}
