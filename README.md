# Sudoku: Classic Puzzle Academy

An Android sudoku game with classic and killer puzzles, a technique academy, and online 1v1 matches.
It is live on Google Play:
[com.powerneja.suidoku](https://play.google.com/store/apps/details?id=com.powerneja.suidoku).
The current release is 1.10.0 (build 34).

한국어: [`README.ko.md`](README.ko.md)

## Who it is for

- **Players who already know sudoku** and want more than random boards: timed modes, a daily puzzle,
  killer sudoku, and a record of how they play.
- **Players who want to get better.** The academy teaches 40 solving techniques, from the last free cell
  to advanced patterns, and every lesson ends with practice boards.
- **Players who like a rival.** You can race another person online or one of five AI opponents.

The app ships in 13 languages, Arabic included in right-to-left layout.

## What is in it

| | |
|---|---|
| Puzzle kinds | Classic and killer (cages with sums). Every mode below works with both kinds. |
| Difficulty | 5 levels. The generator only keeps puzzles with exactly one solution (`src/engine/SudokuEngine.js`, `src/engine/killer/killerGenerator.js`). |
| Modes | Classic, speedrun, survival (time limit), daily challenge, ghost and delta races against your own best run |
| Academy | 40 techniques (32 classic, 8 killer), each with a diagram and 2 practice boards. All 80 boards come from our own generator. |
| First game | A short walkthrough on the first classic and the first killer game, on that game's own board. The academy can replay it. |
| Accessibility | Four text sizes and a high-contrast mode (Settings → Display). Screen readers read every board cell by row, column and contents, with the cage sum in killer. |
| Battles | Online 1v1 over Firebase Realtime Database, with a private path per room, and AI battles at 5 levels |
| Records | Logic Score, a 5-axis play analysis, 40 achievements (also on Play Games), a leaderboard, cloud backup, and a replay of each 1v1 |
| Languages | ko, en, ja, zh-CN, zh-TW, es-ES, de, fr, pt, it, ru, hi, ar |
| Ads | AdMob banner, interstitial and rewarded ads, with the UMP consent form |

## Stack

- **App:** React 19 and Vite 8, plain CSS, no UI framework
- **Android shell:** Capacitor 8. The minimum SDK is 24 and the target SDK is 36; Java 21 is required.
- **Online play:** Firebase Realtime Database with anonymous auth. The security rules live in
  [`firebase.rules.json`](firebase.rules.json).
- **Platform services:** Google Play Games (achievements, leaderboard, saved games),
  AdMob, and Google Analytics for Firebase
- **Tests:** Node scripts and Playwright (Chromium). [`scripts/tests/run_all_qa.js`](scripts/tests/run_all_qa.js)
  runs 74 gates in order: logic, data, translations, static scans, real play-throughs,
  and layout checks in all 13 languages.

## How to run it

You need Node.js 20.19+ or 22.12+ (Vite 8's requirement).
For the Android build you also need Android Studio and JDK 21.

```bash
npm install
cp .env.example .env    # optional, see below
npm run dev             # dev server on http://localhost:5173
```

The game runs without a `.env`. In that case online 1v1 is turned off and ads are drawn as placeholders.
To turn them on, fill in `.env` from your own Firebase project and AdMob account.
[`.env.example`](.env.example) explains each switch.

```bash
npm run build           # web bundle in dist/
npx cap sync android    # copy it into the Android project
npx cap open android    # build and run from Android Studio
```

Firebase on Android also needs your own `android/app/google-services.json`, which is not in the repository.

### Checks

These run from a plain clone, without `.env`:

```bash
npm run lint
npm run build
node scripts/tests/unit/test_battle_killer.js   # one gate; many files in scripts/tests/unit run on their own
```

The full QA pipeline needs two things that are not in this repository, and stops at its first gates
without them:

- the translation checker shared by this project's apps, expected beside it at
  `../../app_common/l10n_engine` (gate 0-3 checks that it is there; gates 1, 2-6 and 2-16 use it)
- a `.env` with Firebase keys (gates 0-5 and 3-0b check that they reach the build)

With both in place:

```bash
npx playwright install chromium   # once
npm run qa:quick                  # quick pass, about 2 minutes
npm run qa                        # all 74 gates, before a release, about 22 minutes
node scripts/tests/run_mutation_audit.js   # breaks the code on purpose to prove the checks catch it (hours)
```

## Roadmap

The live to-do list is [`docs/BACKLOG.md`](docs/BACKLOG.md) (in Korean). The main items:

- **Remove-ads purchase.** The billing code was written against a plugin API that does not exist,
  so it has to be rewritten on a real Play Billing plugin before the product can go on sale.
- **Per-level leaderboards** for classic and speedrun, next to the single Logic Score board
- **Physical keyboard controls** for tablets and DeX: digits, arrows, notes, undo, hint and pause
- **48 dp touch targets** for the mode tabs, bottom menu and keypad
- **Technique analysis in replays.** The app would show which technique made each move possible.
  It would reuse the technique detector the academy authoring tools already use.
- **Puzzle designer:** build your own puzzle, check it has one solution, and share it with a friend
  by code
- **Voice control** as an accessibility option
- **Privacy policy** in more languages, and native-speaker review of the newer store listings

## How it is built

Most of the code is written with AI coding assistants (Claude Code, with ChatGPT and Gemini reviewing).
A person directs the work and makes the decisions.
The rules every assistant follows are in [`AGENTS.md`](AGENTS.md).
Every change is logged in [`docs/SudokuDiary.md`](docs/SudokuDiary.md) with four parts:
what changed, why, what was rejected, and how it was checked.

| File | What it holds |
|---|---|
| [`AGENTS.md`](AGENTS.md) | Working rules for this app (they extend shared rules kept outside this repository) |
| [`docs/BACKLOG.md`](docs/BACKLOG.md) | To-do list |
| [`docs/RELEASE_STATE.md`](docs/RELEASE_STATE.md) | Release and Play Console state |
| [`docs/SudokuDiary.md`](docs/SudokuDiary.md) | Change log with reasons |
| [`docs/TECHNICAL_SPECIFICATION.md`](docs/TECHNICAL_SPECIFICATION.md) | Engine, modes and scoring as of 1.3.2 (2026-09-30). Killer sudoku and later features are not in it yet. |
| [`SudokuAITalk.md`](SudokuAITalk.md) | Reviews from other AI models and what was done with them |
| [`docs/privacy.html`](docs/privacy.html) | Privacy policy, published on k2bact.github.io |

Most of the docs are in Korean. The code, comments and commit messages are mostly in English.

## Folders

```
src/              the app: React components, hooks, engine, ads, 1v1 transport, i18n
android/          Capacitor Android project
scripts/tests/    QA gates and mutation definitions
scripts/scan/     static scans (dead code, translation keys, wiring)
scripts/store/    store screenshots, feature graphics, Play Games import files, release build
scripts/academy/  tools that pick academy practice boards and write their text
store_assets/     store text and images per language
docs/archive/, scripts/archive/   finished docs and one-off scripts, kept for reading only
```

## License

[Mozilla Public License 2.0](LICENSE). The puzzles, academy boards and text are this project's own work.
No third-party puzzles are included.
