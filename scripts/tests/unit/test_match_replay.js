/**
 * test_match_replay.js — gate 2-26: 1v1 replays (I-1, 2026-09-30).
 *
 *   1. What is recorded rebuilds the board: a played game — placements, mistakes,
 *      erasures, notes, an undo, notes cleared by a placement — replayed from its
 *      events ends on exactly the board and notes the player had. A render from
 *      another puzzle, an AI match and a finished match record nothing.
 *   2. The store keeps the last 20 plus pinned ones, drops what is damaged, reads
 *      a record from a newer version, and sheds old replays when storage is full.
 *   3. The exchange is mutual. Both share → both get the other's moves. One
 *      declines → NEITHER sends moves. An opponent that never answers (an older
 *      app) gets nothing. An answer that arrives early still counts. A log for an
 *      earlier match is not attached to this one. A log sent to a player who did
 *      not agree is not kept.
 *   4. A log that does not hold together is refused: a cell outside the board, time
 *      running backwards, a given overwritten, a "win" that does not end on the
 *      solution, a flood of events, text that is not JSON.
 *   5. The real battleService records the move that ends the match — it is
 *      reported before any render, so only sendProgress can see it.
 */
import assert from 'assert';

// ── Minimal browser surface ─────────────────────────────────────────────────
const storage = new Map();
let quotaChars = Infinity;
globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => {
    if (String(v).length > quotaChars) throw new Error('QuotaExceededError');
    storage.set(k, String(v));
  },
  removeItem: (k) => storage.delete(k),
};
globalThis.window = globalThis;
globalThis.window.addEventListener = () => {};
globalThis.window.removeEventListener = () => {};

const { generatePuzzle, cloneGrid, calculateRemainingCounts } = await import('../../../src/engine/SudokuEngine.js');
const rec = await import('../../../src/utils/replay/matchRecorder.js');
const {
  stateAt, gridToString, normalizeRecord, isPlausibleOpponentLog, shownShareState, SHARE_ANSWER_MS, MAX_EVENTS, summarize,
} = await import('../../../src/utils/replay/replayRecord.js');
const store = await import('../../../src/utils/replay/replayStore.js');
const { createReplayExchange } = await import('../../../src/firebase/replayExchange.js');

console.log('======================================================');
console.log('🎬 Gate 2-26: 1v1 replays — recorded, stored, exchanged only by agreement');
console.log('======================================================\n');

const emptyNotes = () => Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => []));
const cells = (grid) => grid.flat();

// ── 1. Recording rebuilds the board ─────────────────────────────────────────
console.log('▶ 1. The recorded moves rebuild the board the player had');
{
  const p = generatePuzzle(3, 'replay-gate-1');
  const room = { code: 'R1', matchSeq: 0, puzzle: p.puzzle, solution: p.solution, status: 'playing', startedAt: Date.now() - 1000 };
  rec.resetRecorder();
  let board = cloneGrid(p.puzzle);
  let notes = emptyNotes();
  const empties = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (!p.puzzle[r][c]) empties.push([r, c]);
  const history = [];
  const push = () => history.push({ board: cloneGrid(board), notes: notes.map((row) => row.map((x) => [...x])) });

  // notes in three cells
  for (const [r, c] of empties.slice(0, 3)) { push(); notes = notes.map((row) => row.map((x) => [...x])); notes[r][c] = [1, 2, 5]; rec.observe(room, board, notes); }
  // a wrong digit, then erase it
  { const [r, c] = empties[3]; push(); board = cloneGrid(board); board[r][c] = (p.solution[r][c] % 9) + 1; rec.observeValues(room, board); rec.observe(room, board, notes);
    push(); board = cloneGrid(board); board[r][c] = 0; rec.observe(room, board, notes); }
  // a placement that clears the same digit from a neighbour's notes (automatic)
  // (the neighbour is another empty cell — the app cannot put notes on a given)
  { const [r, c] = empties[4]; const [nr, nc] = empties[6]; const d = p.solution[r][c]; push(); notes = notes.map((row) => row.map((x) => [...x])); notes[nr][nc] = notes[nr][nc].concat(d);
    rec.observe(room, board, notes);
    push(); board = cloneGrid(board); board[r][c] = d; rec.observeValues(room, board);
    notes = notes.map((row) => row.map((x) => [...x])); notes[nr][nc] = notes[nr][nc].filter((x) => x !== d); rec.observe(room, board, notes); }
  // an undo of that placement
  { const last = history.pop(); rec.markCause('u'); board = cloneGrid(last.board); notes = last.notes; rec.observe(room, board, notes); }
  // then the rest correctly
  for (const [r, c] of empties.slice(4)) { board = cloneGrid(board); board[r][c] = p.solution[r][c]; rec.observeValues(room, board); rec.observe(room, board, notes); }

  const events = rec.snapshot(room).events;
  const rebuilt = stateAt(gridToString(p.puzzle), events);
  assert.deepStrictEqual(rebuilt.values, cells(board), 'replaying the events must end on the board the player had');
  const noteMasks = cells(notes).map((list) => list.reduce((m, d) => m | (1 << d), 0));
  assert.deepStrictEqual(rebuilt.notes, noteMasks, 'replaying the events must end on the notes the player had');
  assert(events.some((e) => e[4] === 'u'), 'the undo must be recorded as an undo');
  assert(events.some((e) => e[1] === 'n' && e[4] === 'a'), 'notes cleared by a placement must be marked automatic');
  assert(events.every((e, i) => i === 0 || e[0] >= events[i - 1][0]), 'event times must never go backwards');
  console.log(`  ✅ ${events.length} events rebuild the final board and notes; undo and automatic removals are tagged`);

  // The summary counts what the player did: 10 notes written (3 cells × 3, then one
  // more), not the one a placement cleared or the one the undo put back; and one
  // undo press, though it changed a value and a note at once.
  const sum = summarize({ solution: gridToString(p.solution), me: { events, elapsedMs: 60000 } }, 'me');
  assert.strictEqual(sum.noteToggles, 10, `notes written by the player: 10, not every note change (${sum.noteToggles})`);
  assert.strictEqual(sum.undos, 1, `undo presses: 1, not the cells it changed (${sum.undos})`);
  console.log('  ✅ the summary counts notes written and undo presses, not their side effects');

  const before = rec.snapshot(room).events.length;
  const other = generatePuzzle(3, 'replay-gate-other');
  rec.observe(room, other.puzzle, emptyNotes());
  assert.strictEqual(rec.snapshot(room).events.length, before, 'a board from another puzzle must record nothing');
  rec.observe({ ...room, isAiMatch: true, code: 'AI' }, board, notes);
  assert.strictEqual(rec.snapshot({ ...room, code: 'AI' }), null, 'an AI match must not be recorded');
  rec.observe({ ...room, status: 'finished' }, p.puzzle, emptyNotes());
  assert.strictEqual(rec.snapshot(room).events.length, before, 'a finished match must record nothing more');
  console.log('  ✅ another puzzle, an AI match and a finished match record nothing');
}

// ── helpers for records ────────────────────────────────────────────────────
const P = generatePuzzle(3, 'replay-gate-2');
const PUZ = gridToString(P.puzzle);
const SOL = gridToString(P.solution);
const solveEvents = () => {
  const out = [];
  let t = 1000;
  for (let i = 0; i < 81; i++) if (PUZ[i] === '0') out.push([(t += 700), 'v', i, Number(SOL[i])]);
  return out;
};
const record = (id, savedAt, extra = {}) => ({
  v: 1, id, savedAt, pinned: false, level: 3, puzzle: PUZ, solution: SOL, winner: 'me', reason: 'my_completion',
  me: { name: 'me', elapsedMs: 60000, mistakes: 0, events: solveEvents() },
  opp: { name: 'them', elapsedMs: null, mistakes: 1, progress: [[5000, 10, 0]], events: null, shareState: 'pending' },
  ...extra,
});

// ── 2. The store ───────────────────────────────────────────────────────────
console.log('▶ 2. Store: last 20 + pinned, damage dropped, newer versions read, full storage sheds');
{
  storage.clear();
  for (let i = 0; i < 25; i++) store.saveReplay(record(`m${i}`, 1000 + i));
  let list = store.listReplays();
  assert.strictEqual(list.length, store.KEEP_RECENT, `25 saved, ${store.KEEP_RECENT} kept`);
  assert.strictEqual(list[0].id, 'm24', 'newest first');
  assert(store.setPinned('m5', true), 'pinning an existing replay works');
  for (let i = 25; i < 45; i++) store.saveReplay(record(`m${i}`, 1000 + i));
  list = store.listReplays();
  assert(list.some((r) => r.id === 'm5' && r.pinned), 'a pinned replay survives twenty newer ones');
  assert.strictEqual(list.filter((r) => !r.pinned).length, store.KEEP_RECENT, 'unpinned still capped');

  const raw = JSON.parse(storage.get(store.REPLAY_STORAGE_KEY));
  raw.push({ v: 1, id: 'bad', puzzle: 'x', solution: SOL, me: {}, opp: {} }, 'nonsense', null);
  raw.push({ ...record('future', 99999), v: 7, somethingNew: true });
  storage.set(store.REPLAY_STORAGE_KEY, JSON.stringify(raw));
  list = store.listReplays();
  assert(!list.some((r) => r.id === 'bad'), 'a damaged record is dropped');
  assert(list.some((r) => r.id === 'future'), 'a record from a newer version is still read');
  assert.strictEqual(normalizeRecord({ ...record('x', 1), me: { events: [[5, 'v', 999, 1]] } }), null, 'a record whose own moves do not hold is dropped');

  storage.clear();
  for (let i = 0; i < 10; i++) store.saveReplay(record(`q${i}`, 1000 + i));
  const size = storage.get(store.REPLAY_STORAGE_KEY).length;
  quotaChars = Math.floor(size * 0.8);
  const saved = store.saveReplay(record('q-new', 5000));
  quotaChars = Infinity;
  assert(saved && store.getReplay('q-new'), 'a full storage sheds old replays and keeps the new one');
  assert(store.listReplays().length < 11, 'something old was shed to make room');

  // Long games stay inside a budget, so replays cannot crowd out the saved game.
  // Twenty recent long games alone fit (~1.7M); twenty pinned ones as well do not,
  // so this is the case where the budget has to act — the count rule never would.
  storage.clear();
  const heavy = Array.from({ length: MAX_EVENTS }, (_, i) => [i, 'n', PUZ.indexOf('0'), 1 + (i % 9)]);
  const long = (id, at) => record(id, at, { me: { name: 'me', elapsedMs: 1, mistakes: 0, events: heavy },
    opp: { name: 'x', elapsedMs: 1, mistakes: 0, progress: [], events: heavy, shareState: 'shared' } });
  for (let i = 0; i < store.KEEP_PINNED; i++) { store.saveReplay(long(`p${i}`, 100 + i)); store.setPinned(`p${i}`, true); }
  for (let i = 0; i < store.KEEP_RECENT; i++) store.saveReplay(long(`h${i}`, 1000 + i));
  const kept = storage.get(store.REPLAY_STORAGE_KEY).length;
  const recentKept = store.listReplays().filter((x) => !x.pinned).length;
  assert(kept <= store.REPLAY_BUDGET_CHARS, `forty very long replays stay within ${store.REPLAY_BUDGET_CHARS} characters (${kept})`);
  assert(recentKept < store.KEEP_RECENT, `the budget, not the count, shed some (${recentKept} recent kept)`);
  assert.strictEqual(store.listReplays().filter((x) => x.pinned).length, store.KEEP_PINNED, 'starred replays are never shed for space');
  assert(store.getReplay(`h${store.KEEP_RECENT - 1}`), 'the newest long replay is among those kept');
  console.log(`  ✅ 20 + pinned · damaged dropped · v7 read · quota sheds the oldest · long games under budget (${recentKept} recent + 20 starred)`);
}

// ── 3. The exchange ────────────────────────────────────────────────────────
console.log('▶ 3. Exchange: mutual, after the match, never to someone who did not agree');
function player(name, { shares = true, answers = true, events = solveEvents() } = {}) {
  const records = new Map();
  const saveReplay = (r) => { const n = normalizeRecord(r); if (n) records.set(n.id, n); return n; };
  const updateReplay = (id, change) => { const cur = records.get(id); if (!cur) return null; const n = normalizeRecord(change(cur)); if (n) records.set(id, n); return n; };
  const ex = createReplayExchange({ snapshot: () => ({ events }), saveReplay, updateReplay, shares: () => shares });
  const sent = [];
  const svc = { myPlayerName: name, currentRoom: null, sendInRoom: (m) => sent.push(m) };
  return { name, ex, svc, records, sent, answers };
}
function room(winner, reason) {
  return { code: 'X1', matchSeq: 0, level: 3, puzzle: P.puzzle, solution: P.solution, status: 'finished', winner, winnerReason: reason, startedAt: Date.now() - 60000, opponentName: 'x', oppProgress: [[1000, 5, 0]] };
}
/** Deliver everything sent so far, in order, until nothing moves. */
function run(a, b) {
  for (let guard = 0; guard < 20; guard++) {
    let moved = false;
    for (const [from, to] of [[a, b], [b, a]]) {
      while (from.sent.length) {
        const m = from.sent.shift();
        moved = true;
        if (!to.answers) continue;
        if (m.type === 'replay_share') to.ex.handleReplayShare(to.svc, m);
        if (m.type === 'match_log') to.ex.handleMatchLog(to.svc, m);
      }
    }
    if (!moved) return;
  }
}
const logsSent = (p) => p.log.filter((m) => m.type === 'match_log').length;
function play({ aShares = true, bShares = true, bAnswers = true, bFirst = false } = {}) {
  const a = player('A', { shares: aShares });
  const b = player('B', { shares: bShares, answers: bAnswers });
  a.svc.currentRoom = room('me', 'my_completion');
  b.svc.currentRoom = room('opponent', 'opponent_completion');
  a.log = []; b.log = [];
  const tap = (p) => { const orig = p.svc.sendInRoom; p.svc.sendInRoom = (m) => { p.log.push(m); orig(m); }; };
  tap(a); tap(b);
  if (bFirst) { b.ex.finishReplay(b.svc); run(a, b); a.ex.finishReplay(a.svc); }
  else { a.ex.finishReplay(a.svc); run(a, b); if (bAnswers) b.ex.finishReplay(b.svc); }
  run(a, b);
  return { a, b, ra: [...a.records.values()][0], rb: [...b.records.values()][0] };
}
{
  let { a, b, ra, rb } = play();
  assert.strictEqual(ra.opp.shareState, 'shared', 'both share: A has B\'s moves');
  assert.strictEqual(rb.opp.shareState, 'shared', 'both share: B has A\'s moves');
  assert(ra.opp.events?.length > 0 && rb.opp.events?.length > 0, 'the moves themselves arrived');
  assert.strictEqual(logsSent(a) + logsSent(b), 2, 'each side sent its moves once');
  console.log('  ✅ both share → each has the other\'s moves (one log each)');

  // The rooms here started 60s ago; the last move is at about 36s. Time in the
  // match is the 60s — a player who stopped moving did not stop playing.
  const near60 = (ms) => Math.abs(ms - 60000) < 3000;
  assert(near60(rb.me.elapsedMs), `the player who did not finish was in the match for its whole length, not until their last move (${rb.me.elapsedMs}ms)`);
  assert(near60(ra.opp.elapsedMs), `an opponent who did not finish is timed to the end of the match too (${ra.opp.elapsedMs}ms)`);
  console.log('  ✅ time in the match runs to its end for the player who did not finish');

  ({ a, b, ra, rb } = play({ bShares: false }));
  assert.strictEqual(logsSent(a), 0, 'A must not send moves to a player who does not share');
  assert.strictEqual(logsSent(b), 0, 'B, not sharing, must not send moves');
  assert.strictEqual(ra.opp.shareState, 'declined', 'A is told B declined');
  assert.strictEqual(rb.opp.shareState, 'off', 'B sees that its own sharing is off');
  console.log('  ✅ one declines → neither sends moves; each side says why');

  ({ a, b, ra } = play({ bAnswers: false }));
  assert.strictEqual(logsSent(a), 0, 'no moves go to an app that never answered');
  assert.strictEqual(ra.opp.shareState, 'pending', 'still waiting right after the match');
  assert.strictEqual(shownShareState(ra, ra.savedAt + SHARE_ANSWER_MS + 1), 'unsupported', 'silence becomes "not supported"');
  console.log('  ✅ an older app that never answers gets nothing; shown as not supported');

  ({ ra, rb } = play({ bFirst: true }));
  assert.strictEqual(ra.opp.shareState, 'shared', 'an answer that arrives before this side finished still counts');
  assert.strictEqual(rb.opp.shareState, 'shared', 'B must get A\'s moves too — A heard B agree before A itself finished');
  console.log('  ✅ an early answer is kept until this side finishes');

  const late = player('A');
  late.svc.currentRoom = room('me', 'my_completion');
  late.ex.finishReplay(late.svc);
  late.ex.handleReplayShare(late.svc, { share: true });
  Object.assign(late.svc.currentRoom, { matchSeq: 1, status: 'playing', replay: null });
  late.ex.handleMatchLog(late.svc, { log: JSON.stringify({ v: 1, events: solveEvents() }) });
  assert.strictEqual([...late.records.values()][0].opp.events, null, 'a log arriving after the rematch began is not attached');
  console.log('  ✅ a log for the match before is not attached to the rematch');

  const shy = player('A', { shares: false });
  shy.svc.currentRoom = room('me', 'my_completion');
  shy.ex.finishReplay(shy.svc);
  shy.ex.handleMatchLog(shy.svc, { log: JSON.stringify({ v: 1, events: solveEvents() }) });
  assert.strictEqual([...shy.records.values()][0].opp.events, null, 'moves pushed to a player who did not agree are not kept');
  console.log('  ✅ unsolicited moves are not kept');
}

// ── 4. Bad logs ────────────────────────────────────────────────────────────
console.log('▶ 4. A log that does not hold together is refused');
{
  const base = record('b1', 1, { winner: 'opponent', reason: 'opponent_completion' });
  // The structural cases are judged against an opponent who LOST: their log need
  // not end on the solution, so only the structure can refuse it.
  const lost = record('b2', 1, { winner: 'me', reason: 'my_completion' });
  const good = solveEvents();
  assert(isPlausibleOpponentLog(good, base), 'control: a real winning log is accepted');
  assert(isPlausibleOpponentLog(good.slice(0, 5), lost), 'control: a losing log that stops part way is accepted');
  const firstEmpty = PUZ.indexOf('0');
  const firstGiven = PUZ.search(/[1-9]/);
  const bad = {
    'a cell outside the board': [lost, [[10, 'v', 99, 1]]],
    'time running backwards': [lost, [[500, 'v', firstEmpty, 1], [100, 'v', firstEmpty, 2]]],
    'a given overwritten': [lost, [[10, 'v', firstGiven, (Number(PUZ[firstGiven]) % 9) + 1]]],
    'a win that does not end on the solution': [base, good.slice(0, -1)],
    'ten thousand events': [lost, Array.from({ length: 10000 }, (_, i) => [i, 'n', firstEmpty, 1])],
  };
  for (const [what, [rec0, events]] of Object.entries(bad)) assert.strictEqual(isPlausibleOpponentLog(events, rec0), null, `must refuse: ${what}`);
  const p = player('A');
  p.svc.currentRoom = room('opponent', 'opponent_completion');
  p.ex.finishReplay(p.svc);
  p.ex.handleReplayShare(p.svc, { share: true });
  p.ex.handleMatchLog(p.svc, { log: '{not json' });
  assert.strictEqual([...p.records.values()][0].opp.shareState, 'invalid', 'text that is not JSON is marked invalid');
  // Through the exchange: a well-formed log that claims a win it did not finish.
  const q = player('A');
  q.svc.currentRoom = room('opponent', 'opponent_completion');
  q.ex.finishReplay(q.svc);
  q.ex.handleReplayShare(q.svc, { share: true });
  q.ex.handleMatchLog(q.svc, { log: JSON.stringify({ v: 1, events: good.slice(0, -1) }) });
  const got = [...q.records.values()][0].opp;
  assert.strictEqual(got.shareState, 'invalid', 'a received log that does not end on the solution must be marked invalid, not shown');
  assert.strictEqual(got.events, null, 'the moves of an invalid log must not be kept');
  console.log(`  ✅ ${Object.keys(bad).length} kinds of bad log refused, non-JSON and an unfinished "win" marked invalid; a real log accepted`);
}

// ── 4b. When the moves cannot come, say so; a long game keeps its start ───
console.log('▶ 4b. Missed moves are called missed; a long game is cut, not lost');
{
  // Left the result before any answer: missed, not "their app has no replays".
  const p = player('A');
  p.svc.currentRoom = room('me', 'my_completion');
  p.ex.finishReplay(p.svc);
  p.ex.abandonReplay(p.svc);
  let r = [...p.records.values()][0];
  assert.strictEqual(r.opp.shareState, 'missed', 'leaving before the answer must read as missed');

  // They said yes, their moves never came: missed after the wait, not unsupported.
  const q = player('A');
  q.svc.currentRoom = room('me', 'my_completion');
  q.ex.finishReplay(q.svc);
  q.ex.handleReplayShare(q.svc, { share: true });
  r = [...q.records.values()][0];
  assert.strictEqual(r.opp.shareState, 'agreed', 'a yes is recorded as agreed until the moves come');
  assert.strictEqual(shownShareState(r, r.savedAt + SHARE_ANSWER_MS + 1), 'missed', 'a yes whose moves never came must read as missed');
  q.ex.handleReplayShare(q.svc, { share: false });
  assert.strictEqual([...q.records.values()][0].opp.shareState, 'agreed', 'a second, contrary answer does not overwrite the first');

  // An app that never answers, and a player who waited past it before leaving.
  const o = player('A');
  o.svc.currentRoom = room('me', 'my_completion');
  o.ex.finishReplay(o.svc);
  const id = [...o.records.keys()][0];
  o.records.set(id, { ...o.records.get(id), savedAt: Date.now() - SHARE_ANSWER_MS - 5000 });
  o.ex.abandonReplay(o.svc);
  r = o.records.get(id);
  assert.strictEqual(shownShareState(r), 'unsupported', 'silence a player waited out still reads as an app without replays');
  console.log('  ✅ left early → missed · yes without moves → missed · silence waited out → not supported');

  // The recorder stops at MAX_EVENTS and says so.
  rec.resetRecorder();
  const g = generatePuzzle(3, 'replay-gate-long');
  const lr = { code: 'L1', matchSeq: 0, puzzle: g.puzzle, solution: g.solution, status: 'playing', startedAt: Date.now() - 1000 };
  const cell = g.puzzle.flat().indexOf(0);
  const notesWith = (on) => { const n = emptyNotes(); if (on) n[Math.floor(cell / 9)][cell % 9] = [1]; return n; };
  for (let i = 0; i < MAX_EVENTS + 5; i++) rec.observe(lr, g.puzzle, notesWith(i % 2 === 0));
  const snap = rec.snapshot(lr);
  assert.strictEqual(snap.events.length, MAX_EVENTS, `the recording stops at ${MAX_EVENTS} events`);
  assert.strictEqual(snap.truncated, true, 'a recording that stopped says it was cut');

  // A cut log of a win is the start of a game: kept, marked, not held to the solution.
  const longLog = Array.from({ length: MAX_EVENTS }, (_, i) => [i, 'n', PUZ.indexOf('0'), 1]);
  const w = player('A');
  w.svc.currentRoom = room('opponent', 'opponent_completion');
  w.ex.finishReplay(w.svc);
  w.ex.handleReplayShare(w.svc, { share: true });
  w.ex.handleMatchLog(w.svc, { log: JSON.stringify({ v: 1, events: longLog, truncated: true }) });
  r = [...w.records.values()][0];
  assert.strictEqual(r.opp.shareState, 'shared', 'a cut log of the winner is accepted');
  assert.strictEqual(r.opp.truncated, true, 'and marked as cut');
  // …but a short log cannot call itself cut to skip that check.
  const s = player('A');
  s.svc.currentRoom = room('opponent', 'opponent_completion');
  s.ex.finishReplay(s.svc);
  s.ex.handleReplayShare(s.svc, { share: true });
  s.ex.handleMatchLog(s.svc, { log: JSON.stringify({ v: 1, events: solveEvents().slice(0, -1), truncated: true }) });
  assert.strictEqual([...s.records.values()][0].opp.shareState, 'invalid', 'a short log claiming to be cut is refused');

  // One log per match: a second one, valid or not, does not replace the first.
  const d = player('A');
  d.svc.currentRoom = room('opponent', 'opponent_completion');
  d.ex.finishReplay(d.svc);
  d.ex.handleReplayShare(d.svc, { share: true });
  d.ex.handleMatchLog(d.svc, { log: JSON.stringify({ v: 1, events: solveEvents() }) });
  d.ex.handleMatchLog(d.svc, { log: '{not json' });
  d.ex.handleMatchLog(d.svc, { log: JSON.stringify({ v: 1, events: solveEvents().slice(0, 3) }) });
  r = [...d.records.values()][0];
  assert.strictEqual(r.opp.shareState, 'shared', 'a second log must not turn moves already received into "invalid"');
  assert.strictEqual(r.opp.events.length, solveEvents().length, 'a second log must not replace the moves already received');
  console.log(`  ✅ cut at ${MAX_EVENTS} and kept · a cut win accepted and marked · a short "cut" log refused`);
}

// ── 5. The real service records the move that ends the match ───────────────
const empties0 = (p) => p.puzzle.flat().filter((v) => v === 0).length;
console.log('▶ 5. battleService records the final move before declaring the match over');
{
  storage.clear();
  rec.resetRecorder();
  const { battleService } = await import('../../../src/firebase/battleService.js');
  const p = generatePuzzle(3, 'replay-gate-5');
  battleService.setupRoom({ code: 'S5', roomId: 'S5', level: 3, puzzle: p.puzzle, solution: p.solution, initialEmptyCount: empties0(p), opponentId: 'x', opponentName: 'them' });
  const room = battleService.currentRoom;
  let board = cloneGrid(p.puzzle);
  const empties = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (!p.puzzle[r][c]) empties.push([r, c]);
  for (const [r, c] of empties) {
    board = cloneGrid(board);
    board[r][c] = p.solution[r][c];
    battleService.sendProgress(calculateRemainingCounts(board), 0, board);
    if (battleService.currentRoom.status === 'finished') break;
    rec.observe(room, board, emptyNotes()); // the render that follows a move
  }
  const saved = store.getReplay('S5-0');
  assert(saved, 'finishing a 1v1 must save its replay');
  assert.strictEqual(stateAt(saved.puzzle, saved.me.events).values.join(''), saved.solution,
    'the saved replay must end on the solved board — the last move is reported before any render');
  assert.strictEqual(saved.opp.shareState, 'pending', 'control: nobody has answered yet');
  battleService.leaveRoom();
  assert.strictEqual(store.getReplay('S5-0').opp.shareState, 'missed', 'leaving the room before the answer marks the moves as missed');
  console.log('  ✅ the saved replay ends on the solution; leaving before the answer marks it missed');
}

console.log('\n🎉 [2-26] PASSED — replays rebuild the board, keep their limits, and are exchanged only by agreement.');
// The service's same-device transport keeps a BroadcastChannel open; nothing else ends the process.
process.exit(0);
