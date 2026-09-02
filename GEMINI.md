# Antigravity App-Level Mandatory Rules & Operational Protocols (Suidoku)

This file contains mandatory operational protocols and strict automation triggers for `Suidoku`.
Any agent working on this repository MUST follow these rules without omission, regardless of conversation length.

---

## 🚀 1. Trigger: Release AAB Build & Store Deployment Protocol
Whenever the user requests an AAB build (e.g., "aab 만들어줘", "release build", "배포 빌드"):
1. **Version Code & Name Verification**:
   - Check `android/app/build.gradle`.
   - Ensure `versionCode` is incremented (must never reuse a previous version code uploaded to Google Play).
   - Increment `versionName` accordingly (e.g. `1.2.1`).
2. **Build Web & Android Assets**:
   - Run `npm.cmd run build; npx.cmd cap sync android`.
   - Run `gradlew.bat bundleRelease` in `android/`.
3. **Mandatory Archive Replication (Strict Rule)**:
   - Immediately copy the generated AAB (`android/app/build/outputs/bundle/release/app-release.aab`) to `release_archive/` with TWO filenames:
     a) `release_archive/suidoku-v<versionName>-release.aab`
     b) `release_archive/app-release.aab`
   - Report the exact paths, file sizes, version code, and version name to the user.

---

## 🌐 2. Trigger: Multi-Language L10N Audit & Translation Updates
Whenever localization audit feedback is received or translation files are modified:
1. **Simultaneous Engine Rule Registration**:
   - Every linguistic fix, terminology rule, or platform standard MUST be simultaneously encoded into `../app_common/l10n_engine/`:
     - Universal rules in `core/` (Gate 1~8)
     - App-specific rules in `profiles/suidoku.mjs`
     - Spec documentation in `../app_common/l10n_engine/L10N_ENGINE_AUDIT_SPEC_AND_WHITELIST.md`
2. **13-Locale Full Regression Verification**:
   - Run `node ../app_common/l10n_engine/validator.mjs --app suidoku`.
   - Ensure 100% PASS across all 13 locales (`ar`, `de`, `en`, `es-ES`, `fr`, `hi`, `it`, `ja`, `ko`, `pt`, `ru`, `zh-CN`, `zh-TW`).
3. **Web Bundle Build Verification**:
   - Run `npm.cmd run build` to verify zero syntax/compilation errors.

---

## 📸 3. Trigger: Real Device Store Screenshots Processing
Whenever screenshots from `C:\Users\hsdin\Downloads\Mobile Devices\` are processed:
1. **System Bar Cropping**:
   - Top crop: exactly `115px` (status bar).
   - Bottom crop: exactly `135px` (navigation bar).
   - Final resolution: `1080 × 2390 px`.
2. **AdMob Banner Removal**:
   - For screenshot #02 (`Screenshot_*_Sudoku.jpg`), paint out the bottom AdMob banner area (`y: 1890..2390`) with dark theme color `#0F172A` = RGB(15, 23, 42).
3. **Target Placement & Cleanup**:
   - Save to `store_assets/<locale>/` as both `<locale>_screenshot_real_01~08.png` and `screenshot_real_01~08.png`.
   - Delete source files from `C:\Users\hsdin\Downloads\Mobile Devices\`.

---

## 🎨 4. Trigger: Feature Graphic Generation
All Google Play feature graphics must strictly conform to:
1. **Dimensions**: `1024 × 500 px`, RGB, NO alpha channel (GATE 9).
2. **Left Header**:
   - Badge: `☀ SUDOKU`
   - Title Line 1: `Sudoku` (or localized script name matching store ASO policy)
   - Title Line 2: Exact app name noun phrase (e.g. `Rompicapo di logica`, `Классическая логика`)
3. **Tagline**:
   - Maximum 1 single line (`white-space: nowrap`), 3-bullet core value propositions (Classic, 32 techniques, IQ report & 1v1 duels).
4. **File Placement**:
   - Save to `store_assets/<locale>/<locale>_feature_graphic_1024x500.png` and `feature_graphic_1024x500.png`.

---

## 📱 5. Trigger: APK Debug Build & Physical Device Testing
Whenever APK installation is requested:
1. Build debug bundle and sync Capacitor.
2. Build debug APK: `gradlew.bat assembleDebug` in `android/`.
3. Install to connected device: `adb -s R3CW60KA6YM install -r ...app-debug.apk`.
4. Launch app: `adb -s R3CW60KA6YM shell am start -n com.powerneja.suidoku/.MainActivity`.

---

## 🛡️ 6. Trigger: Dynamic QA Ingestion & Auto-Consolidation Protocol
Whenever the user requests a new verification, bug check, or audit rule (e.g., "이것도 검증해", "QA 추가해", "이 버그 잡고 검증 체계에 넣어"):
1. **Step 1: Gap Analysis Against Existing Pipeline (기존 검증 체계와 비교)**:
   - Search existing test suites (`../app_common/l10n_engine` and `scripts/tests/`) to inspect if this rule/assertion is already covered.
2. **Step 2: Auto-Ingestion & Classification (신규 검증 내용의 기존 체계 자동 편입)**:
   - If NOT covered (새로운 검증 내용인 경우), NEVER create loose/ad-hoc scripts. Immediately encode and absorb the new check into the existing 3-Tier architecture:
     a) **Universal Multi-App (전역 공통 언어/정책)** ➔ `../app_common/l10n_engine/core/` (Gate 1~9 확장)
     b) **App-Specific Domain / L10N (앱 전용 사전/도메인)** ➔ `../app_common/l10n_engine/profiles/suidoku.mjs`
     c) **App Game Logic & Math (앱 핵심 알고리즘/수학/데이터)** ➔ `scripts/tests/unit/test_<feature>.js`에 편입
     d) **App UI / UX / Native Platform (앱 화면/접근성/OS)** ➔ `scripts/tests/ui/test_<feature>.js`에 편입
3. **Step 3: Master Runner Registration & 100% Regression Execution (마스터 파이프라인 등록 및 전수 회귀)**:
   - Immediately register the new test step into `scripts/tests/run_all_qa.js` or `validator.mjs`.
   - Run `node scripts/tests/run_all_qa.js` to ensure 100% PASS (0 errors) across both existing and newly added verification rules.

---

## ⚡ 7. Core Engineering Standards & Defect Prevention (Mandatory Guidelines)
Whenever implementing features, fixing bugs, or refactoring code:
1. **Zero State Mutation & Return Contract**:
   - Helper functions (e.g. solvers, validators) MUST NEVER mutate state arrays in-place. Always perform operations on deep copies (e.g. `cloneGrid()`).
   - Functions returning solution arrays must explicitly return the grid object, NEVER a raw boolean (`true`/`false`).
2. **React Interval & Timer Stability**:
   - External callbacks passed into `useEffect` intervals (e.g. `onTimeLimitExpire`) must be wrapped in `useRef` to prevent unneeded interval teardown/reset during rapid user taps.
   - Game over state transitions (e.g. countdown expiration) must use transition guards (1 ➔ 0 only) to prevent duplicate defeat invocations upon navigation.
   - Never call a side effect from inside a `setState` updater. Updaters must stay pure; move the
     effect into its own `useEffect` keyed on the resulting value.
3. **Cross-Component Metric Scale Consistency**:
   - When the same metric is rendered in two places (e.g. my vs. opponent progress), both must be
     computed on an identical denominator. Board progress uses **initially-empty cells**, never all 81
     cells — the latter starts the bar at the puzzle's given-clue ratio (30~62%) instead of 0%.
4. **One Source of Truth for "Today"**:
   - Every daily system (challenge, attendance streak, monthly badge) must derive its day key from
     `src/utils/dateKey.js` (`getTodayDateKey`), which is **local time**. Never use
     `toISOString().split('T')[0]` — that keys the day off UTC and desynchronises resets by the
     timezone offset (09:00 in KST).
5. **Security & Signing Key Isolation**:
   - Release keystore files (`.jks`), passwords, and alias secrets must NEVER be committed to Git. Store secrets in `keystore.properties` (or environment variables) and ensure `.gitignore` coverage.
6. **Data Key Consistency Across Services**:
   - Always verify exact localStorage key matches (e.g. `suidoku_user_wallet_v1`, `suidoku_daily_records_v1`) across storage, wallet, and sync services before committing.
7. **Node ESM Import Extension Compliance** (scoped — read the scope before mass-editing):
   - Node's ESM resolver does not guess extensions; Vite's does. The rule therefore binds
     **only on modules reachable from a test entry point** (`scripts/tests/**`), not on all of `src/`.
   - Any module on that graph must spell relative imports out in full (`from './storage.js'`).
   - `src/` currently holds ~219 extension-less imports across ~73 files that are reached only
     through Vite. Those are correct as-is — **do NOT bulk-rewrite them.** Rewriting files no test
     imports produces a large diff with zero behavioural benefit.
   - When a new test pulls in a module that was previously app-only, add extensions along that
     newly-reachable path only.
   - Enforced automatically by QA gate `0-3` (`test_esm_import_extensions.js`), which walks the real
     import graph from every test entry point. Trust the gate over manual inspection.


