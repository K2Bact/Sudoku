import { ALL_PRACTICE_MISSIONS } from '../../../src/data/academy/practice/index.js';
import { ACADEMY_STAGES } from '../../../src/data/academyStrategies.js';
import { LOCALES } from '../../lib/locales.js';
import { solveKiller } from '../../../src/engine/killer/killerSolver.js';

console.log('====================================================');
console.log('🧪 ACADEMY INTERACTIVE PRACTICE HARNESS');
console.log('====================================================');

let totalStrategies = 0;
let totalMissions = 0;
let errors = [];

// 지금 저장소에 실제로 존재하는 수. 아래에서 단언한다.
// 늘어나면 이 숫자를 같이 올리고, 줄었다면 왜 줄었는지 먼저 확인할 것.
const EXPECTED_STRATEGIES = 40;
const EXPECTED_MISSIONS = 80;

/**
 * 한 자리 숫자를 감싼 대괄호만 고른다. 후보 묶음은 제외한다.
 *
 * `[3,8]` 은 은닉쌍의 후보 두 개이고 `[2,5,8]` 은 삼중수다. 그것들은 정답이나
 * 소거값을 가리키는 말이 아니므로 이 검사의 대상이 아니다. 뒤따르는 쉼표나
 * 숫자를 부정형 전방탐색으로 걸러 `[3]` 과 `[3,8]` 을 구분한다.
 */
const SINGLE_BRACKETED_DIGIT = /\[(\d)\](?![\s]*[,0-9])/g;

ACADEMY_STAGES.forEach(stage => {
  console.log(`\n▶ Stage: ${stage.id}`);
  stage.strategies.forEach(strat => {
    totalStrategies++;
    const missions = ALL_PRACTICE_MISSIONS[strat.id];
    if (!missions || missions.length < 2) {
      errors.push(`Strategy '${strat.id}' is missing missions! Found: ${missions ? missions.length : 0}`);
      console.log(`  ❌ [FAIL] ${strat.id}: Missing 2 missions`);
      return;
    }

    missions.forEach((m) => {
      totalMissions++;
      if (m.targetIndex === undefined || m.targetIndex < 0 || m.targetIndex >= m.cells.length) {
        errors.push(`[${m.id}] Invalid targetIndex: ${m.targetIndex} in cells length ${m.cells.length}`);
      }
      if (!m.correctVal || m.correctVal < 1 || m.correctVal > 9) {
        errors.push(`[${m.id}] Invalid correctVal: ${m.correctVal}`);
      }

      // 문장이 말해도 되는 숫자를, 화면이 실제로 그리는 칸에서 끌어낸다.
      // 이 두 줄이 아래 제목 검사의 근거 전부다. 여기에 숫자를 적지 않는 것이
      // 요점이다 — 적어두면 데이터가 바뀔 때 같이 낡는다.
      const targetCell = m.cells?.[m.targetIndex] || {};
      const eliminated = targetCell.eliminatedNotes || [];
      const allowed = new Set([m.correctVal, ...eliminated]);

      /** field → lang → 그 문장이 말한 한 자리 숫자들. 언어 간 대조에 쓴다. */
      const saidBy = {};

      // Every language the app ships, read from the app — not a list written here.
      //
      // This used to be ['ko','en','ja','zh','es'] and it passed for months while
      // two shipped languages had no practice text at all. `zh` and `es` exist in
      // this data but the app never asks for them: the selector offers `zh-CN`,
      // `zh-TW` and `es-ES`. So the check was verifying keys nobody reads, and the
      // keys players actually hit were missing and falling back to English.
      LOCALES.forEach(lang => {
        const titleText = m.title?.[lang];
        const guideText = m.guide?.[lang];
        if (!titleText) errors.push(`[${m.id}] Missing title for lang: ${lang}`);
        if (!guideText) errors.push(`[${m.id}] Missing guide for lang: ${lang}`);

        if (guideText) {
          // In stage 1 beginner quiz missions (Full House, Last Free Cell), the answer is deliberately asked as a quiz riddle
          const isQuizQuestion = m.id.startsWith('full_house') || m.id.startsWith('last_free_cell');
          // A mission that asks which candidate is removed must not print the answer.
          const asksEliminated = m.asks === 'eliminated';
          if (asksEliminated && guideText.includes(`[${m.correctVal}]`)) {
            errors.push(`[${m.id}] Lang '${lang}' guide gives away the eliminated candidate [${m.correctVal}]`);
          }
          if (!isQuizQuestion && !asksEliminated) {
            const hasVal = guideText.includes(String(m.correctVal)) || guideText.includes(`[${m.correctVal}]`);
            if (!hasVal) {
              errors.push(`[${m.id}] Lang '${lang}' guide mentions wrong number! Expected correctVal [${m.correctVal}], got: "${guideText}"`);
            }
          }
        }

        // 제목도 검사한다. 여기가 비어 있었고, 버그는 정확히 여기 있었다.
        //
        // 위의 안내문 검사는 오래 초록이었다. 그동안 34개 미션의 제목이 엉뚱한
        // 숫자를 말하고 있었다 — "[9] 확정" 인데 정답은 6 인 식으로, 13개 언어
        // 전부. 번역 잘못이 아니라 한국어 원본이 틀렸고 12개 언어가 충실히
        // 옮긴 것이다. 게이트가 두 필드 중 한쪽만 봤기 때문에 안 걸렸다.
        //
        // 안내문 검사 자체도 약하다. `includes(String(correctVal))` 는 문자열
        // 어디에든 그 숫자가 있으면 통과한다 — correctVal 이 2 일 때
        // "2개 가로줄에서" 의 2 로도 통과한다. 존재를 보고 일치를 안 본 것이다.
        //
        // 그래서 아래 규칙은 값을 이 파일에 적어두지 않고 데이터에서 끌어낸다.
        // 제목·안내문이 대괄호로 감싼 한 자리 숫자는 둘 중 하나여야 한다:
        //   · correctVal                                  플레이어가 넣을 답
        //   · cells[targetIndex].eliminatedNotes 의 값     기법이 지우는 후보
        // 제목은 이 둘 중 하나를 말하거나, 아무 숫자도 말하지 않는다.
        // 셋째 숫자가 나오면 그 문장은 화면의 퍼즐과 다른 말을 하고 있다.
        [
          ['title', titleText],
          ['guide', guideText],
        ].forEach(([field, text]) => {
          if (!text) return;
          for (const hit of text.matchAll(SINGLE_BRACKETED_DIGIT)) {
            const n = Number(hit[1]);
            if (allowed.has(n)) continue;
            errors.push(
              `[${m.id}] Lang '${lang}' ${field} claims [${n}] but the cell allows ` +
                `{${[...allowed].join(', ')}} (correctVal ${m.correctVal}` +
                `${eliminated.length ? `, eliminates ${eliminated.join(',')}` : ''}): "${text}"`,
            );
          }
          (saidBy[field] ||= {})[lang] = new Set(
            [...text.matchAll(SINGLE_BRACKETED_DIGIT)].map((h) => h[1]),
          );
        });
      });

      // 위 검사만으로는 부족하다. 허용 집합은 두 값을 받아들이므로 정답과
      // 소거값을 맞바꾼 제목은 그대로 통과한다 — 변이 테스트에서 실제로
      // SURVIVED 가 나왔다. 그 구멍을 언어 간 대조로 막는다.
      //
      // 13개 언어는 같은 퍼즐 하나를 설명한다. 그러니 숫자를 말하는 언어들은
      // 같은 숫자를 말해야 한다. 한 언어만 다른 숫자를 말하면 그 언어가 틀렸다.
      // 숫자를 아예 말하지 않는 제목은 주장을 하지 않은 것이므로 대조에서 뺀다
      // (실제로 "X-Wing Corner Lock" 처럼 숫자 없는 제목이 146곳 있다).
      //
      // 두 검사는 서로 다른 것을 잡는다. 같이 있어야 한다:
      //   허용 집합    13개 언어가 다 같이 틀린 경우 (이번에 나온 34개 미션)
      //   언어 간 대조 한 언어만 벗어난 경우 (번역 중 숫자가 어긋나는 경우)
      Object.entries(saidBy).forEach(([field, byLang]) => {
        const groups = new Map();
        for (const [lang, digits] of Object.entries(byLang)) {
          if (!digits.size) continue;
          const key = [...digits].sort().join(',');
          (groups.get(key) || groups.set(key, []).get(key)).push(lang);
        }
        if (groups.size <= 1) return;
        const shown = [...groups].map(([k, ls]) => `[${k}] in ${ls.join(',')}`).join(' vs ');
        errors.push(
          `[${m.id}] ${field} names different numbers in different languages — ${shown}. ` +
            `All thirteen describe one puzzle, so one of these is a translation that drifted.`,
        );
      });
    });

    console.log(`  ✅ [PASS] ${strat.id} (2 Missions: ${missions[0].id}, ${missions[1].id})`);
  });
});

// ── 판이 정답을 정말 정하는가 ────────────────────────────────────────────
//
// 위의 검사는 문장과 데이터가 같은 숫자를 말하는지만 본다. 데이터에 적힌
// 정답이 그 판에서 실제로 유도되는지는 아무도 보지 않았고, 2026-09-18 에
// 그 값을 치렀다: 은닉 쌍·삼중·사중 연습 6개가 「이 기법만으로는 정해지지
// 않는 칸」 에 정답 하나를 요구하고 있었다. 은닉 부분집합은 그 칸들에서
// 여분 후보를 지울 뿐, 어느 칸이 어느 숫자인지는 정하지 않는다. 그중 하나는
// 더 나빴다 — 표기된 후보로는 **어떤 배치도 성립하지 않는** 판이었다.
//
// 화면은 그동안 "정답!" 이라고 답했다. 입력이 데이터의 correctVal 과 같은지
// 비교한 결과일 뿐이고, 그것은 풀이의 증명이 아니다. 그래서 여기서 센다.
//
// 모든 연습을 셀 수는 없다. 상급 기법의 판은 관련 숫자의 후보만 그린
// **부분 그림**이다(BUG+1 은 9칸에 숫자 3개만 나온다). 부분 그림에 대고
// "한 칸에 한 숫자씩" 을 요구하면 옳은 그림이 빨갛게 된다. 그래서 판이
// 스스로 완결됐다고 말할 때만 — 칸 수만큼(또는 그 이상) 서로 다른 숫자가
// 보일 때만 — 센다. 그때는 배치가 존재해야 하고, 목표 칸의 값은 하나여야
// 한다.
const CLOSED_LAYOUTS = new Set(['row', 'box3x3']);
let checked = 0;
let skipped = 0;
for (const missions of Object.values(ALL_PRACTICE_MISSIONS)) {
  for (const m of missions) {
    if (!CLOSED_LAYOUTS.has(m.layoutType)) { skipped++; continue; }

    // 후보는 기법이 지우기 **전**의 것이다. 목표 칸의 eliminatedNotes 는 그
    // 판에서 지워지는 값이므로, 후보 집합에 되돌려 놓고 센다.
    const candidates = m.cells.map((c) => {
      if (c.notes) return [...new Set([...c.notes, ...(c.eliminatedNotes || [])])];
      if (typeof c.val === 'number' && c.val > 0) return [c.val];
      if (c.val === 0 || c.val === undefined) return null; // 빈 칸 — 아래에서 채운다
      return false; // '·', '✕' 같은 장식 칸: 이 판은 부분 그림이다
    });
    if (candidates.includes(false)) { skipped++; continue; }

    const shown = new Set([m.correctVal]);
    for (const c of candidates) if (c) for (const d of c) shown.add(d);
    if (shown.size < m.cells.length) { skipped++; continue; }

    const all = [...shown].sort((a, b) => a - b);
    const cells = candidates.map((c) => c || all);
    const values = new Set();
    const place = (i, used, targetVal) => {
      if (values.size > 1) return; // 이미 갈렸다
      if (i === cells.length) { values.add(targetVal); return; }
      for (const d of cells[i]) {
        if (used.has(d)) continue;
        used.add(d);
        place(i + 1, used, i === m.targetIndex ? d : targetVal);
        used.delete(d);
      }
    };
    place(0, new Set(), null);
    checked++;

    if (values.size === 0) {
      errors.push(
        `[${m.id}] 이 판에는 성립하는 배치가 하나도 없다 — 표기된 후보끼리 모순이다. ` +
          '화면은 정답을 맞다고 답하지만, 그 판은 스도쿠가 아니다.',
      );
    } else if (values.size > 1 || !values.has(m.correctVal)) {
      errors.push(
        `[${m.id}] 목표 칸이 ${[...values].sort().join(', ')} 중 어느 값도 될 수 있는데 ` +
          `correctVal 은 ${m.correctVal} 이다. 기법이 정하지 못하는 칸에 정답 하나를 요구하고 있다.`,
      );
    }
  }
}
console.log(`\n▶ 판이 정답을 정하는가: ${checked}개 미션 검증 · ${skipped}개는 부분 그림이라 제외`);

// ── 전체 판(9x9)으로 그린 예제: 그 퍼즐의 해답과 맞는가 ─────────────────
//
// 상급 기법 예제 36개는 앱의 퍼즐 생성기로 만든 자체 퍼즐에서 뽑았다. 외부
// 퍼즐은 쓰지 않는다(저작권 위험을 지지 않기 위해). 뽑을 때 유일해와 대조했지만,
// 그 대조가 여기 없으면 누군가 한 칸을 고쳐도 아무도 모른다. 그래서 판에 적힌
// 것만으로 다시 푼다:
//   · 값이 적힌 칸은 고정, 후보가 적힌 칸은 그 후보(지워진 것 포함) 안에서만
//   · 해가 정확히 하나여야 한다
//   · 지워졌다고 표시한 후보는 그 칸의 해가 아니어야 한다
//   · 답을 묻는 미션은 correctVal 이 목표 칸의 해, 지워지는 후보를 묻는 미션은
//     correctVal 이 목표 칸의 후보이면서 해가 아니어야 한다
const PEERS = Array.from({ length: 81 }, (_, i) => {
  const r = Math.floor(i / 9), c = i % 9, set = new Set();
  for (let k = 0; k < 9; k++) { set.add(r * 9 + k); set.add(k * 9 + c); }
  const br = r - (r % 3), bc = c - (c % 3);
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) set.add((br + a) * 9 + bc + b);
  set.delete(i);
  return [...set];
});
let fullChecked = 0;
let killerChecked = 0;
for (const missions of Object.values(ALL_PRACTICE_MISSIONS)) {
  for (const m of missions) {
    if (m.layoutType !== 'grid9x9') continue;
    fullChecked++;
    let sol;
    if (m.cages) {
      // A killer lesson. Its board shows few digits and leaves most cells blank (notes
      // only where the step works), so the search below would wander. The cages must
      // tile the board, the app's killer solver (gate 2-27) must find exactly one
      // solution from the cages and the digits shown, and every note must hold that
      // solution's digit — notes that rule out the answer make a wrong board.
      killerChecked++;
      const cover = m.cages.flatMap((c) => c.cells);
      if (cover.length !== 81 || new Set(cover).size !== 81) {
        errors.push(`[${m.id}] 묶음이 판을 정확히 한 번씩 덮지 않는다 (칸 ${cover.length}개, 서로 다른 칸 ${new Set(cover).size}개)`);
        continue;
      }
      const givens = Array.from({ length: 9 }, (_, r) => m.cells.slice(r * 9, r * 9 + 9).map((c) => c.val || 0));
      const res = solveKiller(m.cages, givens, { limit: 2, nodeLimit: 200000 });
      if (res.aborted || res.count !== 1) {
        errors.push(`[${m.id}] 묶음과 판의 숫자로 풀면 해가 ${res.aborted ? '정해지지 않는다(탐색 한도)' : `${res.count}개다`} — 판이 틀어졌다`);
        continue;
      }
      sol = res.solutions[0].flat();
      m.cells.forEach((c, i) => {
        if (c.notes && ![...c.notes, ...(c.eliminatedNotes || [])].includes(sol[i])) {
          errors.push(`[${m.id}] r${Math.floor(i / 9) + 1}c${(i % 9) + 1} 의 후보 ${c.notes.join('')} 에 해 ${sol[i]} 가 없다`);
        }
      });
    } else {
      const allowed = m.cells.map((c) => (c.notes ? [...new Set([...c.notes, ...(c.eliminatedNotes || [])])] : [c.val]));
      const g = m.cells.map((c) => (c.notes ? 0 : c.val));
      const sols = [];
      const solve = () => {
        if (sols.length > 1) return;
        let best = -1;
        let bestC = null;
        for (let i = 0; i < 81; i++) {
          if (g[i]) continue;
          const used = new Set(PEERS[i].map((p) => g[p]));
          const c = allowed[i].filter((d) => !used.has(d));
          if (!c.length) return;
          if (!bestC || c.length < bestC.length) { best = i; bestC = c; }
        }
        if (best < 0) { sols.push(g.slice()); return; }
        for (const d of bestC) { g[best] = d; solve(); g[best] = 0; }
      };
      solve();
      if (sols.length !== 1) {
        errors.push(`[${m.id}] 판에 적힌 값·후보로 풀면 해가 ${sols.length}개다 — 판이 틀어졌다`);
        continue;
      }
      sol = sols[0];
    }
    m.cells.forEach((c, i) => {
      for (const d of c.eliminatedNotes || []) {
        if (d === sol[i]) errors.push(`[${m.id}] r${Math.floor(i / 9) + 1}c${(i % 9) + 1} 에서 해 ${d} 를 지운다고 표시했다`);
      }
    });
    // The step's own record of what it removes or places. The theory tab draws its
    // second frame from these (BACKLOG A-1: the hand-drawn theory diagrams got 17 of
    // 32 wrong), so they are held to the same solution as everything else here.
    for (const [i, ds] of m.eliminations || []) {
      const cand = [...(m.cells[i]?.notes || []), ...(m.cells[i]?.eliminatedNotes || [])];
      for (const d of ds) {
        if (!cand.includes(d)) errors.push(`[${m.id}] eliminations: r${Math.floor(i / 9) + 1}c${(i % 9) + 1} 에 후보 ${d} 가 없는데 지운다고 적었다`);
        if (d === sol[i]) errors.push(`[${m.id}] eliminations: r${Math.floor(i / 9) + 1}c${(i % 9) + 1} 의 해 ${d} 를 지운다고 적었다`);
      }
    }
    for (const [i, d] of m.placements || []) {
      if (d !== sol[i]) errors.push(`[${m.id}] placements: r${Math.floor(i / 9) + 1}c${(i % 9) + 1} 에 ${d} 를 놓는다고 적었는데 해는 ${sol[i]} 이다`);
    }
    if (!(m.eliminations || m.placements)) {
      errors.push(`[${m.id}] 9x9 예제에 eliminations/placements 가 없다 — 이론 도식이 그릴 제거 단계가 없다`);
    }
    const t = m.targetIndex;
    if (m.asks === 'eliminated') {
      const cand = m.cells[t].notes || [];
      if (!cand.includes(m.correctVal) || m.correctVal === sol[t]) {
        errors.push(`[${m.id}] 지워지는 후보로 ${m.correctVal} 을 묻는데, 목표 칸의 해는 ${sol[t]} 이고 후보는 ${cand.join('')} 이다`);
      }
    } else if (m.correctVal !== sol[t]) {
      errors.push(`[${m.id}] correctVal ${m.correctVal} 이 목표 칸의 해 ${sol[t]} 와 다르다`);
    }
  }
}
console.log(`▶ 9x9 예제 ${fullChecked}개를 판에 적힌 대로 다시 풀어 해답과 대조 (그중 킬러 ${killerChecked}개는 묶음까지)`);

// ── 이론 탭 도식: 검사 밖에 둔 것이 없는가 ──────────────────────────────────
//
// 2026-09-19 (BACKLOG A-1): 연습 64개는 이 파일이 검증했지만 이론 탭의 손그림
// 도식은 아무 검사도 받지 않았고, 32개 중 17개가 규칙상 틀려 있었다. 그 17개는
// 이제 예제 1 의 9x9 판을 그대로 그린다(TheoryBoardDiagram) — 위에서 해답과
// 대조한 그 판과 eliminations/placements 다. 나머지 15개는 사람이 하나씩 규칙으로
// 확인한 손그림이다. 새 전략이 어느 쪽에도 없으면 실패한다: 검사 밖에 도식을
// 두는 일이 다시 생기지 않게.
{
  const fs = await import('fs');
  const src = fs.readFileSync(new URL('../../../src/components/academy/TheoryBoardDiagram.jsx', import.meta.url), 'utf8');
  const boardTheory = new Set([...(src.match(/BOARD_THEORY = new Set\(\[([\s\S]*?)\]\)/) || ['', ''])[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
  // Hand-drawn, checked by the rules one by one on 2026-09-19 (theory dump).
  const HAND_VERIFIED = new Set([
    'full-house', 'last-free-cell', 'cross-hatching', 'naked-single', 'hidden-single', 'claiming',
    'naked-pair', 'hidden-pair', 'naked-triple', 'hidden-triple', 'naked-quad', 'hidden-quad',
    'y-wing', 'xyz-wing', 'forcing-chains',
  ]);
  let covered = 0;
  for (const stage of ACADEMY_STAGES) for (const strat of stage.strategies) {
    const id = strat.id;
    if (boardTheory.has(id)) {
      const m = ALL_PRACTICE_MISSIONS[id]?.[0];
      if (!m || m.layoutType !== 'grid9x9' || !(m.eliminations || m.placements)) {
        errors.push(`[theory:${id}] 이론 도식이 예제 1 을 그리는데, 예제 1 이 9x9 가 아니거나 제거/배치 데이터가 없다`);
      } else covered++;
    } else if (HAND_VERIFIED.has(id)) covered++;
    else errors.push(`[theory:${id}] 이론 도식이 검증되지 않았다 — BOARD_THEORY 에 넣거나, 규칙으로 확인한 뒤 HAND_VERIFIED 에 적을 것`);
  }
  console.log(`▶ 이론 도식 ${covered}개: 9x9 판 ${boardTheory.size}개 + 손그림 확인 ${HAND_VERIFIED.size}개`);
}


// ── 6x6 입문 그림(크로스해칭): 박스 안에서 그 숫자가 갈 곳이 목표 칸뿐인가 ──
// 6x6 창은 실제 3x3 박스 경계를 그린다. 목표 칸이 든 박스에서, 이미 숫자가
// 있는 칸을 빼고 나머지 빈칸은 전부 같은 행이나 열(창 안)에 correctVal 이
// 있어야 하고, 목표 칸 자신은 그렇지 않아야 한다. 그리고 그 박스에 이미
// correctVal 이 있으면 안 된다. 이것이 크로스해칭의 정의 그대로다.
let hatchChecked = 0;
for (const missions of Object.values(ALL_PRACTICE_MISSIONS)) {
  for (const m of missions) {
    if (m.layoutType !== 'grid6x6' || !m.id.startsWith('cross_hatching')) continue;
    hatchChecked++;
    const W = 6;
    const v = (r, c) => m.cells[r * W + c]?.val;
    const d = m.correctVal;
    const tr = Math.floor(m.targetIndex / W), tc = m.targetIndex % W;
    const br = tr - (tr % 3), bc = tc - (tc % 3);
    const seesD = (r, c) => [...Array(W).keys()].some((k) => v(r, k) === d || v(k, c) === d);
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        const val = v(r, c);
        if (val === d) errors.push(`[${m.id}] 목표 박스에 이미 ${d} 가 있다`);
        if (r === tr && c === tc) {
          if (seesD(r, c)) errors.push(`[${m.id}] 목표 칸이 같은 행/열의 ${d} 에 막혀 있다`);
          continue;
        }
        if (typeof val === 'number' && val > 0) continue;
        if (!seesD(r, c)) errors.push(`[${m.id}] r${r + 1}c${c + 1} 도 ${d} 가 들어갈 수 있다 — 목표 칸 하나로 정해지지 않는다`);
      }
    }
  }
}
console.log(`▶ 크로스해칭 입문 그림 ${hatchChecked}개를 박스 단위로 검증`);

console.log('\n----------------------------------------------------');
console.log(`Total Strategies Checked: ${totalStrategies} / ${EXPECTED_STRATEGIES}`);
console.log(`Total Missions Verified:  ${totalMissions} / ${EXPECTED_MISSIONS}`);

// 개수를 실제로 단언한다. 예전에는 27 과 54 를 화면에 찍기만 했다.
//
// 변이 테스트에서 stage5 를 통째로 지웠더니 "27 / 27", "54 / 54" 가 찍히고
// "PERFECT! ALL 54 INTERACTIVE MISSIONS ARE 100% VALIDATED!" 로 통과했다.
// 기대값이 낡아서(실제는 32/64) 부서진 상태와 정확히 맞아떨어졌기 때문이다.
// 표시만 하는 숫자는 검사가 아니고, 낡은 기대값은 삭제를 보상한다.
if (totalStrategies !== EXPECTED_STRATEGIES) {
  errors.push(`전략 수가 ${EXPECTED_STRATEGIES} 이어야 하는데 ${totalStrategies} 개다 — 스테이지나 전략이 사라졌는지 확인`);
}
if (totalMissions !== EXPECTED_MISSIONS) {
  errors.push(`미션 수가 ${EXPECTED_MISSIONS} 이어야 하는데 ${totalMissions} 개다`);
}

if (errors.length > 0) {
  console.error('\n🚨 ERRORS DETECTED:');
  errors.forEach(e => console.error(' - ' + e));
  process.exit(1);
} else {
  console.log(`\n🎉 PERFECT! ALL ${totalMissions} INTERACTIVE MISSIONS ARE 100% VALIDATED!`);
}
