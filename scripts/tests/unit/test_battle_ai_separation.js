/**
 * test_battle_ai_separation.js
 * QA Gate: AI Battle vs 1v1 PvP Result Isolation & Locked Popup Audit
 * Ensures AI battles NEVER leak 1v1 titles or MMR penalties, and locked popup persists without auto-dismiss.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

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
const locales = ['ko', 'en', 'ja', 'zh-TW', 'zh-CN', 'es-ES', 'de', 'fr', 'pt', 'it', 'ru', 'hi', 'ar'];

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

assert(!homeContent.includes('setTimeout(() => setLockedToast'), 'HomeScreen does not auto-dismiss lockedToast with setTimeout');
assert(homeContent.includes('locked-mode-popup'), 'HomeScreen uses dedicated locked-mode-popup class');
assert(homeContent.includes('locked-popup-close-btn'), 'HomeScreen has explicit close button for locked popup');
assert(!homeContent.includes('<Target size={12} />'), 'HomeScreen removed duplicate Lucide Target icon from standard chip');
assert(!homeContent.includes('<Ghost size={12} />'), 'HomeScreen removed duplicate Lucide Ghost icon from ghost chip');

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
const ruleExists = existsSync('.gemini/rules/multilingual_layout_rules.md');

assert(aiBattleContent.includes('ai-level-spec-card'), 'AIBattleScreen renders dedicated ai-level-spec-card');
assert(aiBattleContent.includes('spec-desc-grid-stack'), 'AIBattleScreen uses auto-equalizing spec-desc-grid-stack');
assert(battleCssContent.includes('grid-area: 1 / 1'), 'battle.css uses grid-area 1 / 1 for adaptive height synchronization');
assert(ruleExists, '.gemini/rules/multilingual_layout_rules.md exists in project');

// 8. Android Native System Insets & Safe Area Clean Break Audit
console.log('\n▶ Testing Android Native System Insets & Safe Area Inset Protection...');
const mainActivityContent = readFileSync('android/app/src/main/java/com/powerneja/suidoku/MainActivity.java', 'utf8');
const stylesXmlContent = readFileSync('android/app/src/main/res/values/styles.xml', 'utf8');
const capConfigContent = readFileSync('capacitor.config.json', 'utf8');
const academyCssContent = readFileSync('src/styles/academy.css', 'utf8');
const screensCssContent = readFileSync('src/styles/screens.css', 'utf8');

assert(mainActivityContent.includes('findViewById(android.R.id.content)'), 'MainActivity binds insets to root android.R.id.content FrameLayout');
assert(mainActivityContent.includes('setOnApplyWindowInsetsListener'), 'MainActivity enforces ViewCompat.setOnApplyWindowInsetsListener');
assert(mainActivityContent.includes('v.setPadding(insets.left, insets.top, insets.right, insets.bottom)'), 'MainActivity physically sets padding on content FrameLayout');
assert(mainActivityContent.includes('Type.displayCutout()'), 'MainActivity accounts for camera displayCutout insets');
assert(stylesXmlContent.includes('<item name="android:fitsSystemWindows">true</item>'), 'styles.xml specifies android:fitsSystemWindows true');
assert(stylesXmlContent.includes('android:windowOptOutEdgeToEdgeEnforcement'), 'styles.xml specifies windowOptOutEdgeToEdgeEnforcement');
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

console.log('\n======================================================');
if (failed > 0) {
  console.error(`❌ [AUDIT FAILED] ${failed} check(s) failed.`);
  process.exit(1);
} else {
  console.log(`🎉 [AUDIT PASSED] All ${passed} checks passed 100%! AI vs 1v1 isolation guaranteed.`);
  process.exit(0);
}
