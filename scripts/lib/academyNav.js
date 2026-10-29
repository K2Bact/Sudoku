/**
 * academyNav.js
 * Open one Academy stage the way a player does (D34, 2026-10-27).
 *
 * The Academy used to be one tab bar — 「1단계 … 5단계 · 킬러」 — and the gates that
 * walk it clicked the stage's index in ACADEMY_STAGES. The killer stage now sits
 * behind the 표준 | 킬러 switch, and a kind with a single stage has no tab bar at all,
 * so an index into the whole list no longer names a tab. Every gate that opens a
 * stage goes through here, so the next change to that path is made once.
 */
import { variantOf } from '../../src/engine/variants.js';
import { ACADEMY_STAGES } from '../../src/data/academyStrategies.js';

/** The stages one side of the switch shows, in the order the tab bar draws them. */
export const stagesOfKind = (kind) => ACADEMY_STAGES.filter((s) => variantOf(s) === kind);

/**
 * Pick the stage's kind on the switch, then its tab when that kind has several.
 * Expects the Academy screen to be open. `stage` is an entry of ACADEMY_STAGES.
 */
export async function openAcademyStage(page, stage) {
  const kind = variantOf(stage);
  await page.locator(`.academy-kind-bar .variant-option[data-variant="${kind}"]`).click();
  const siblings = stagesOfKind(kind);
  if (siblings.length > 1) {
    await page.locator('.academy-tab-bar .seg-tab-btn').nth(siblings.indexOf(stage)).click();
  }
}
