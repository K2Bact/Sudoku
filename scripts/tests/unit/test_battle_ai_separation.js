/**
 * test_battle_ai_separation.js
 * QA Gate: AI Battle vs 1v1 PvP Result Isolation & Locked Popup Audit
 * Ensures AI battles NEVER leak 1v1 titles or MMR penalties, and locked popup persists without auto-dismiss.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { LOCALES } from '../../lib/locales.js';

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✅ [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${msg}`);
    failed++;
  }
}

console.log('======================================================');
console.log('🧪 QA Gate: AI Battle vs 1v1 PvP Isolation & Popup Audit');
console.log('======================================================\n');

// 1. 13-Language Dictionary Audit for AI Battle Isolation
const locales = LOCALES; // 목록을 여기 적지 않는다 — scripts/tests/lib/locales.js 가 앱에서 읽어온다

for (const lang of locales) {
  console.log(`▶ Testing Locale [${lang}]...`);
  const screensContent = readFileSync(`src/i18n/locales/${lang}/screens.js`, 'utf8');

  // Verify AI specific keys exist
  assert(screensContent.includes('aiVictoryTitle:'), `[${lang}] screens.battleResult.aiVictoryTitle exists`);
  assert(screensContent.includes('aiDefeatTitle:'), `[${lang}] screens.battleResult.aiDefeatTitle exists`);
  assert(screensContent.includes('aiModeLabel:'), `[${lang}] screens.battleResult.aiModeLabel exists`);
  assert(screensContent.includes('aiWonBadge:'), `[${lang}] screens.battleResult.aiWonBadge exists`);
  assert(screensContent.includes('aiLostBadge:'), `[${lang}] screens.battleResult.aiLostBadge exists`);
  assert(screensContent.includes('aiLobbyBtn:'), `[${lang}] screens.battleResult.aiLobbyBtn exists`);
  assert(screensContent.includes('aiRematchBtn:'), `[${lang}] screens.battleResult.aiRematchBtn exists`);

  // Verify Obsolete Friend Code keys are completely purged
  assert(!screensContent.includes('codeTitle:'), `[${lang}] screens.battleLobby has no obsolete codeTitle`);
  assert(!screensContent.includes('codeDesc:'), `[${lang}] screens.battleLobby has no obsolete codeDesc`);
  assert(!screensContent.includes('enter5Digits:'), `[${lang}] screens.battleLobby has no obsolete enter5Digits`);

  // Verify AI titles do NOT leak "1v1" or "1:1"
  const aiVicMatch = screensContent.match(/aiVictoryTitle:\s*['"`]([^'"`]+)['"`]/);
  if (aiVicMatch) {
    assert(!aiVicMatch[1].includes('1v1') && !aiVicMatch[1].includes('1:1'), `[${lang}] aiVictoryTitle ("${aiVicMatch[1]}") does not contain '1v1'`);
  } else {
    assert(false, `[${lang}] aiVictoryTitle not matched`);
  }

  const aiDefMatch = screensContent.match(/aiDefeatTitle:\s*['"`]([^'"`]+)['"`]/);
  if (aiDefMatch) {
    assert(!aiDefMatch[1].includes('1v1') && !aiDefMatch[1].includes('1:1'), `[${lang}] aiDefeatTitle ("${aiDefMatch[1]}") does not contain '1v1'`);
  } else {
    assert(false, `[${lang}] aiDefeatTitle not matched`);
  }
}

// 2. BattleResultModal Component Strict Isolation Audit
console.log('\n▶ Testing BattleResultModal.jsx Logic...');
const modalContent = readFileSync('src/components/BattleResultModal.jsx', 'utf8');

assert(modalContent.includes('isAIBattle'), 'BattleResultModal defines isAIBattle flag');
assert(modalContent.includes('aiVictoryTitle') && modalContent.includes('aiDefeatTitle'), 'BattleResultModal branches on AI victory/defeat titles');
assert(modalContent.includes('ai-banner-card'), 'BattleResultModal renders dedicated ai-banner-card');
assert(modalContent.includes('aiLobbyBtn'), 'BattleResultModal switches lobby button to aiLobbyBtn in AI mode');
assert(modalContent.includes('aiRematchBtn'), 'BattleResultModal switches rematch button to aiRematchBtn in AI mode');
assert(modalContent.includes('aiModeLabel'), 'BattleResultModal displays aiModeLabel');

// 3. useBattleMultiplayer.js Flow Separation Audit
console.log('\n▶ Testing useBattleMultiplayer.js Action Separation...');
const hookContent = readFileSync('src/hooks/useBattleMultiplayer.js', 'utf8');

assert(hookContent.includes('handleRequestRematch'), 'useBattleMultiplayer defines handleRequestRematch');
assert(hookContent.includes('startAIBattle'), 'useBattleMultiplayer restarts AI battle immediately on rematch');
assert(hookContent.includes("setActiveScreen(isAIBattle ? 'aiBattle' : 'battleLobby')"), 'useBattleMultiplayer routes to aiBattle on AI match close');

// 4. HomeScreen Locked Popup & Icon Cleanliness Audit
console.log('\n▶ Testing HomeScreen.jsx Locked Popup & Non-duplicate Icons...');
const homeContent = readFileSync('src/components/HomeScreen.jsx', 'utf8');
// The chips, the ⓘ and both popups live here now — HomeScreen.jsx went over its
// 280-line budget and the rival block was the one coherent piece to lift out
// (gate 0-1). The checks follow the code; reading the old file would have passed
// them all by finding nothing to object to.
const rivalContent = readFileSync('src/components/home/RivalModeChips.jsx', 'utf8');

assert(!rivalContent.includes('setTimeout(() => setLockedToast'), 'RivalModeChips does not auto-dismiss lockedToast with setTimeout');
assert(rivalContent.includes('locked-mode-popup'), 'RivalModeChips uses dedicated locked-mode-popup class');
assert(rivalContent.includes('locked-popup-close-btn'), 'RivalModeChips has explicit close button for locked popup');
assert(!rivalContent.includes('<Target size={12} />'), 'RivalModeChips removed duplicate Lucide Target icon from standard chip');
assert(!rivalContent.includes('<Ghost size={12} />'), 'RivalModeChips removed duplicate Lucide Ghost icon from ghost chip');

// 4b. A locked chip has to say WHICH lock it is.
//
// Ghost and Time Gap are off for two unrelated reasons: you have not set a
// record on this difficulty yet, or you are in Survival, where they are off by
// design and no record will ever turn them on. One line served both, so
// Survival told the player to go and earn something that was never coming
// (user report, 2026-09-26).
//
// This is invisible to a screenshot test and to a translation count — both
// sentences exist, and the wrong one is a perfectly good sentence.
const rivalKo = readFileSync('src/i18n/locales/ko/screens.js', 'utf8');
assert(/["']?timeLimitToast["']?\s*:/.test(rivalKo),
  'home.rivalModes.timeLimitToast must exist — Survival needs its own reason');
assert(/setLockedToast\(\s*t\(\s*isTimeLimit\s*\?/.test(rivalContent),
  'the locked toast must choose its line by reason: Survival gets timeLimitToast, everyone else lockedToast');

for (const lang of locales) {
  const src = readFileSync(`src/i18n/locales/${lang}/screens.js`, 'utf8');
  assert(/["']?timeLimitToast["']?\s*:/.test(src), `[${lang}] rivalModes.timeLimitToast exists`);
}

// Survival must actually be the mode that switches them off, or the line above
// is chosen for a condition that never happens.
assert(/canSelectGhost\s*=\s*!isTimeLimit/.test(rivalContent),
  'Survival must be what disables ghost and delta — the toast branches on it');

// 4c. The two rival modes have to say how they differ.
//
// Ghost and Time Gap looked like two names for the same thing, because on screen
// that is what they were: the same banner, the same ±seconds badge, the same two
// bars. The one difference decides everything — Ghost deals the puzzle the record
// was set on, Time Gap deals a new one — and nothing said so (user report,
// 2026-09-26). An ⓘ beside the chips now explains both.
// The class name, not a string that starts with it: renaming it to
// rival-info-btnXX left /rival-info-btn/ perfectly happy.
assert(/rival-info-btn(?![\w-])/.test(rivalContent),
  'the rival chips need the ⓘ that explains them');
assert(/\.rival-info-btn\s*\{/.test(readFileSync('src/styles/ghostBanner.css', 'utf8')),
  'the ⓘ needs its style, or it is an unstyled button in the middle of the chips');
assert(/home\.rivalModes\.infoGhost/.test(rivalContent) && /home\.rivalModes\.infoDelta/.test(rivalContent),
  'the explainer must describe BOTH modes — one of them alone is the confusion, not the fix');

// The label has to be on the BUTTON. Searching the whole file for infoAria
// passed with the button's label deleted, because the popup carries one too.
const infoBtnTag = (() => {
  const at = rivalContent.search(/rival-info-btn(?![\w-])/);
  if (at === -1) return '';
  const open = rivalContent.lastIndexOf('<button', at);
  const close = rivalContent.indexOf('>', at);
  return open === -1 || close === -1 ? '' : rivalContent.slice(open, close);
})();
assert(/aria-label=/.test(infoBtnTag),
  'the ⓘ needs a label on the button itself; an icon-only button says nothing to a screen reader');

for (const lang of locales) {
  const src = readFileSync(`src/i18n/locales/${lang}/screens.js`, 'utf8');
  for (const key of ['infoAria', 'infoGhost', 'infoDelta']) {
    assert(new RegExp(`["']?${key}["']?\\s*:`).test(src), `[${lang}] rivalModes.${key} exists`);
  }
  // Same sentence for both modes would pass every count and teach nothing.
  const grab = (k) => (src.match(new RegExp(`["']?${k}["']?\\s*:\\s*(["'])([\\s\\S]*?)\\1`)) || [])[2];
  const g = grab('infoGhost');
  const d = grab('infoDelta');
  assert(g && d && g !== d, `[${lang}] infoGhost and infoDelta must differ — the point is that the modes do`);
}

assert(/<RivalModeChips\b/.test(homeContent) && /from '\.\/home\/RivalModeChips'/.test(homeContent),
  'HomeScreen must render RivalModeChips — a chip group nothing mounts is a file, not a feature');

// 5. AI Bot Immediate Loop Termination Audit
console.log('\n▶ Testing AI Bot Immediate Loop Termination on Match Finish...');
const battleServiceContent = readFileSync('src/firebase/battleService.js', 'utf8');
const aiBotContent = readFileSync('src/engine/aiBotService.js', 'utf8');
// The AI match loop moved out of battleService into aiBattleSession so the PvP
// path holds only peer-to-peer concerns. The guarantees below are unchanged;
// only their file changed.
const aiSessionContent = readFileSync('src/firebase/aiBattleSession.js', 'utf8');

assert(
  battleServiceContent.includes('aiBotService.stopMatch()') || aiSessionContent.includes('aiBotService.stopMatch()'),
  'the AI match loop is explicitly stopped on completion'
);
assert(
  aiSessionContent.includes("room.status === 'finished' || room.winner"),
  'aiBattleSession ignores bot updates once the match is finished'
);
assert(
  aiSessionContent.includes('stillLive()'),
  'aiBattleSession guards every bot callback behind a liveness check'
);
assert(aiBotContent.includes('this.intervalId = null'), 'aiBotService cleanly nullifies intervalId on stopMatch');

// 6. AI Difficulty Balance & Humanized Solving Pace Audit
console.log('\n▶ Testing AI Difficulty Balance & 3-Mistake Disqualification...');
assert(aiBotContent.includes('AI_LEVEL_PROFILES'), 'aiBotService defines structured AI_LEVEL_PROFILES');
assert(aiBotContent.includes('this.botState.mistakes >= 3'), 'aiBotService allows bot to be disqualified on 3 mistakes');
assert(
  aiSessionContent.includes("botState.mistakes >= 3") && aiSessionContent.includes("finish('me', 'opponent_mistakes')"),
  'aiBattleSession awards the win to the player when the bot is disqualified on 3 mistakes'
);
assert(
  aiSessionContent.includes('if (!room || room.winner) return false'),
  'aiBattleSession never overwrites a result that has already been decided'
);

// 7. Multilingual Auto-Equalizer Zero-Layout-Shift Audit
console.log('\n▶ Testing Multilingual Auto-Equalizer Zero-Layout-Shift System...');
const aiBattleContent = readFileSync('src/components/AIBattleScreen.jsx', 'utf8');
const battleCssContent = readFileSync('src/styles/battle.css', 'utf8');
// The Grid Stack pattern is only safe while somebody writes down why it is there.
// This used to require `.gemini/rules/multilingual_layout_rules.md` — a file only one
// of the three assistants working here ever read. On 2026-09-08 that half and the
// other half (in the playbook) were merged into the l10n constitution, which is where
// rules the validator enforces already live. The assertion follows the content, not
// the old path: what matters is that the pattern is documented somewhere every agent
// reads, and that the document actually describes THIS pattern.
const LAYOUT_STANDARD = '../../app_common/l10n_engine/GLOBAL_L10N_STANDARDS.md';
const layoutDoc = existsSync(LAYOUT_STANDARD) ? readFileSync(LAYOUT_STANDARD, 'utf8') : '';

assert(aiBattleContent.includes('ai-level-spec-card'), 'AIBattleScreen renders dedicated ai-level-spec-card');
assert(aiBattleContent.includes('spec-desc-grid-stack'), 'AIBattleScreen uses auto-equalizing spec-desc-grid-stack');
assert(battleCssContent.includes('grid-area: 1 / 1'), 'battle.css uses grid-area 1 / 1 for adaptive height synchronization');
assert(layoutDoc.includes('grid-area: 1 / 1'),
  'GLOBAL_L10N_STANDARDS must document the Grid Stack pattern that battle.css relies on. ' +
  'Without it the next person deletes `grid-area: 1 / 1` as dead CSS and every ' +
  'language-dependent card starts shifting height again.');
assert(/Delta Height\s*=\s*0/.test(layoutDoc),
  'GLOBAL_L10N_STANDARDS must state the Delta Height = 0 requirement the pattern exists to meet.');

// 8. Android Native System Insets & Safe Area Clean Break Audit
console.log('\n▶ Testing Android Native System Insets & Safe Area Inset Protection...');
const mainActivityContent = readFileSync('android/app/src/main/java/com/powerneja/suidoku/MainActivity.java', 'utf8');
// Comments stripped: the file explains at length why the attributes below are
// gone, and a plain includes() finds the words in that explanation. The same
// trap caught gate 2-23 this morning, in CSS.
const stylesXmlContent = readFileSync('android/app/src/main/res/values/styles.xml', 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '');
const capConfigContent = readFileSync('capacitor.config.json', 'utf8');
const academyCssContent = readFileSync('src/styles/academy.css', 'utf8');
const screensCssContent = readFileSync('src/styles/screens.css', 'utf8');

assert(mainActivityContent.includes('findViewById(android.R.id.content)'), 'MainActivity binds insets to root android.R.id.content FrameLayout');
assert(mainActivityContent.includes('setOnApplyWindowInsetsListener'), 'MainActivity enforces ViewCompat.setOnApplyWindowInsetsListener');
assert(mainActivityContent.includes('v.setPadding(insets.left, insets.top, insets.right, insets.bottom)'), 'MainActivity physically sets padding on content FrameLayout');
assert(mainActivityContent.includes('Type.displayCutout()'), 'MainActivity accounts for camera displayCutout insets');
// The window reserves room for the system bars in ONE place: the inset listener
// above. These two attributes used to be required here, as a second line of
// defence — and that was the defect. windowOptOutEdgeToEdgeEnforcement is
// honoured on Android 15 and ignored from targetSdk 36, so the app ran two
// different layouts, and on 15 the window ended above the navigation bar AND was
// padded again: an empty band under the banner, 24dp with gestures and 48dp with
// three buttons (measured on emulators, SudokuDiary ㊷). fitsSystemWindows is the
// other half of that double reserve. Neither may come back.
assert(!stylesXmlContent.includes('fitsSystemWindows'),
  'styles.xml must NOT set fitsSystemWindows — with the inset listener it reserves the bars twice (㊷)');
assert(!stylesXmlContent.includes('windowOptOutEdgeToEdgeEnforcement'),
  'styles.xml must NOT opt out of edge-to-edge — Android 15 honours it and 16 ignores it, which is two layouts (㊷)');
assert(!stylesXmlContent.includes('navigationBarColor') && !stylesXmlContent.includes('statusBarColor'),
  'bar colours do nothing under edge-to-edge; what shows behind the bars is the window background');
assert(capConfigContent.includes('adjustMarginsForEdgeToEdge'), 'capacitor.config.json specifies adjustMarginsForEdgeToEdge');
assert(academyCssContent.includes('safe-area-inset-bottom'), 'academy.css enforces bottom safe area padding');
assert(screensCssContent.includes('safe-area-inset-bottom'), 'screens.css enforces bottom safe area padding');

// ── 코드 수준 격리 ──────────────────────────────────────────────────────
//
// 이 게이트의 이름은 "AI Battle vs 1v1 PvP Isolation" 인데, 위 검사는 전부 문구
// 분리였다 — AI 결과 화면에 1v1 표현이 안 섞이는지, AI 전용 번역 키가 13개
// 언어에 있는지. 정작 "AI 세션이 실제 1v1 전송 계층을 안 건드리는가" 는 아무도
// 보고 있지 않았다.
//
// 변이 테스트에서 aiBattleSession.js 에 battleService import 를 넣었는데도
// 게이트가 통과했다. 이름이 약속하는 것을 내용이 지키지 않고 있었다.
//
// AI 대전이 실제 전송 계층에 닿으면 봇과의 연습이 매칭 큐에 티켓을 흘리거나
// 상대의 방 상태를 건드릴 수 있다. 그건 화면 문구로는 절대 안 드러난다.
const aiSessionSrc = readFileSync('src/firebase/aiBattleSession.js', 'utf8');
const AI_FORBIDDEN_IMPORTS = [
  ['battleService', 'AI 세션이 실제 1v1 서비스를 끌어오면 봇 대전이 매칭 큐에 닿는다'],
  ['transport', 'AI 세션이 멀티플레이 전송 계층을 끌어오면 로컬 연습이 네트워크를 탄다']
];
for (const [mod, why] of AI_FORBIDDEN_IMPORTS) {
  const importsIt = new RegExp('(import|require)[^\\n]*[\'"`][^\'"`]*' + mod).test(aiSessionSrc);
  assert(!importsIt, `aiBattleSession must not import ${mod} — ${why}`);
}

// ── 상대가 없을 때의 AI 제안은 "고르러 가기" 여야 한다 ──────────────────
//
// 1v1 검색이 12초 동안 아무도 못 찾으면 "AI와 대전할까요?" 를 띄운다. 그 버튼이
// 곧장 **Lv.3 대전을 시작**하고 있었다 — 부르는 쪽이 3 을 박아 넣었기 때문이다.
// 화면 어디에도 그 말은 없다. 이용자는 "AI와 대전" 을 눌렀을 뿐인데 난이도를
// 남이 고른 판 한가운데에 놓인다(사용자 보고, 2026-09-26).
//
// 다섯 단계가 있고 고르는 곳은 AI 로비다. 홈의 AI 버튼이 가는 바로 그 화면이다.
//
// 이 경로에는 검사가 하나도 없었다. 화면 문구 검사로는 못 잡는다 — 문구는
// 그대로였고 바뀐 것은 눌렀을 때 벌어지는 일이다.
console.log('\n▶ Testing the no-opponent fallback...');
{
  const hookSrc = readFileSync('src/hooks/useBattleMultiplayer.js', 'utf8');
  const lobbySrc = readFileSync('src/components/BattleLobbyScreen.jsx', 'utf8');
  const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

  // 중괄호를 세어 함수 몸통만 본다. 넉넉한 창으로 자르면 다음 함수까지 읽혀
  // 없어진 코드를 남의 것으로 통과시킨다(게이트 3-2 에서 두 번 그랬다).
  const body = (code, name) => {
    const at = code.indexOf(name);
    if (at === -1) return null;
    const open = code.indexOf('{', at);
    let depth = 0;
    for (let i = open; i < code.length; i++) {
      if (code[i] === '{') depth++;
      else if (code[i] === '}' && --depth === 0) return code.slice(open, i + 1);
    }
    return null;
  };

  const fallback = body(strip(hookSrc), 'startAIFallback');
  assert(Boolean(fallback), 'useBattleMultiplayer must define startAIFallback');
  assert(Boolean(fallback) && /setActiveScreen\(\s*'aiBattle'\s*\)/.test(fallback),
    "the no-opponent fallback must open the AI lobby (setActiveScreen('aiBattle'))");
  assert(Boolean(fallback) && !/startAIBattle\s*\(/.test(fallback),
    'the fallback must NOT start a match itself — that is what pinned every one of them to Lv.3');
  assert(Boolean(fallback) && !/startNewGame\s*\(/.test(fallback),
    'the fallback must not deal a board; the AI lobby does that once a level is chosen');

  const handler = body(strip(lobbySrc), 'handlePlayAi');
  assert(Boolean(handler), 'BattleLobbyScreen must define handlePlayAi');
  assert(Boolean(handler) && !/onPlayAiInstead\s*\(\s*\d/.test(handler),
    'the lobby must not hand the fallback a level number — the player picks it');
}

console.log('\n======================================================');
if (failed > 0) {
  console.error(`❌ [AUDIT FAILED] ${failed} check(s) failed.`);
  process.exit(1);
} else {
  console.log(`🎉 [AUDIT PASSED] All ${passed} checks passed 100%! AI vs 1v1 isolation guaranteed.`);
  process.exit(0);
}
