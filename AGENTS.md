# 🚨 SUIDOKU PROJECT CRITICAL IMMUTABLE RULES & QA PROTOCOL

> This document defines mandatory, non-negotiable project rules for all AI models working on the Suidoku codebase.

---

## 🚫 1. [CRITICAL] NO UNPROMPTED AAB / APK BUILDS
* **NEVER run `bundleRelease`, `assembleRelease`, or any Android AAB/APK binary build commands unless the user EXPLICITLY commands you to build (e.g. "AAB 빌드해", "릴리즈 파일 만들어").**
* For testing, inspecting, checking, fixing, or adding translations, **STOP after running tests/validation (`npm run qa`). DO NOT build binary packages on your own.**

---

## 📏 2. [CRITICAL] ONE FILE, ONE SET OF RESPONSIBILITIES

**The rule is about separating responsibilities. The line budget only tells you when to look.**

| Scope | Warn | Fail |
|---|---|---|
| Logic (`*.js`, `*.jsx`) | 200 code lines | 280 code lines |
| Styles (`*.css`) | — | 320 code lines |

* **Comments and blank lines are NOT counted.** Explain as much as the code needs; the
  budget is for logic only.
* **Never shorten a comment to get under the limit.** That is not a fix — it makes the
  code less clear while leaving the real problem in place. This actually happened on
  2026-09-02: `battleService.js` hit 302 lines and a comment was compressed back to 299,
  while the file went on doing matchmaking, progress, rematch and AI battles all at once.
  When it crossed the line again it was split into `aiBattleSession.js`, and *that* was
  the fix.
* **When a file is flagged, ask what it does — not how long it is.** The gate prints the
  file's top-level units so you can see the seams. If you cannot name each unit's single
  job in one phrase, that is where to split.
* `src/i18n/` and `src/data/` are **excluded**: flat translation and puzzle tables have no
  responsibilities to separate.
* Enforced by QA gate `0-1` (`scripts/tests/unit/test_file_responsibility.js`). The warning
  tier is a standing backlog, not noise — files on it should shrink over time, not grow.

---

## 🌐 3. [CRITICAL] MULTILINGUAL (I18N) & UI INTEGRITY PROTOCOL
1. **Zero Hardcoded User-Facing Text**:
   * NEVER write raw Korean/English strings directly in JSX or code templates (e.g. `${name} 님이...` is FORBIDDEN).
   * All user-facing strings MUST use `t('section.key')` and be simultaneously registered across ALL 5 languages (`ko`, `en`, `ja`, `zh-TW`, `es-ES`).
2. **Language Button Endonym Rule**:
   * Language selector buttons MUST ONLY display native endonyms without redundant parentheses:
     - 🌐 `시스템 기본값` (System Default / 系統預設 / システム標準 / Predeterminado)
     - 🇰🇷 `한국어`
     - 🇺🇸 `English`
     - 🇯🇵 `日本語`
     - 🇹🇼 `繁體中文`
     - 🇪🇸 `Español`
   * NO `(Korean)`, `(English)`, `(자동)`, `(Auto)`, `(韓文)` parentheses allowed.
3. **2-Column Symmetrical Grid**:
   * Language selections must remain an even count (currently 6) to keep a balanced 3×2 grid with no orphan slots.
4. **Dynamic Interpolation**:
   * Dynamic variables MUST use `{variable}` syntax in dictionaries and be passed via `t('key', { variable: value })`.

---

## 🎮 4. [CRITICAL] CORE GAMEPLAY RUNTIME SCENARIO INTEGRITY
1. **Revival Life Recovery (부활)**:
   * When a player revives via rewarded ad after 3 mistakes, `mistakes` MUST be set to `2` (`setMistakes(2)`) in ALL game modes so the header displays `실수 2/3`.
2. **1v1 Battle Result**:
   * Victory / Defeat subtitles, mistake disqualification reasons, and heart states (`💀 실격`) must be 100% localized with dynamic opponent names.
3. **Calendar Headers**:
   * Weekdays must use localized day labels (`일~토`, `S~S`, `日~土`, `D~S`).

---

## 🧪 5. [CRITICAL] AUTOMATED QA GATES (`npm run qa`)
Before declaring ANY work complete, you MUST run:
```bash
npm run qa
```
This automatically executes:
1. `check_no_hardcoded_text.js` — Zero hardcoded text scan
2. `check_i18n_completeness.js` — 5-language completeness audit (415 keys)
3. `< 300 lines` file length verification
4. `oxlint` — Static quality analysis
5. `check_ui_overflow.js` — Playwright layout & text overflow test across all 5 languages
