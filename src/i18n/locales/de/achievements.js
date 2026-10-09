export const achievements = {
  achievements: {
    categories: {
      all: 'Alle',
      progression: 'Fortschritt',
      logic: 'Fehlerfrei',
      speed: 'Tempo',
      difficulty: 'Schwierigkeit',
      special: 'Täglich & Duell'
    },
    unlockedToast: 'Erfolg freigeschaltet!',
    tabTitle: 'Erfolge',
    statsTab: 'Statistik',
    unlockedCount: '{unlocked} / {total} freigeschaltet ({pct}%)',
    lockedBadge: 'Gesperrt',
    pointsTotal: '{count} Pkt.',
    tiers: { bronze: 'Bronze', silver: 'Silber', gold: 'Gold', diamond: 'Diamant', master: 'Meister' },
    unlockedAt: 'Freigeschaltet: {date}',

    // 1 ~ 7. Progression & Wins
    first_win: { title: 'Erster Schritt', desc: 'Löse dein allererstes Sudoku-Rätsel auf beliebiger Stufe' },
    win_5: { title: 'High Five', desc: 'Löse insgesamt 5 Sudoku-Rätsel' },
    win_10: { title: 'Rätsel-Liebhaber', desc: 'Löse insgesamt 10 Sudoku-Rätsel' },
    win_25: { title: 'Silber-Puzzler', desc: 'Löse insgesamt 25 Sudoku-Rätsel' },
    win_50: { title: 'Gold-Veteran', desc: 'Löse insgesamt 50 Sudoku-Rätsel' },
    win_100: { title: 'Hunderter-Club', desc: 'Löse insgesamt 100 Sudoku-Rätsel' },
    win_250: { title: 'Sudoku-Legende', desc: 'Löse insgesamt 250 Sudoku-Rätsel' },

    // Days checked in, in all (2026-10-08, D11)
    visit_30: { title: 'Stammgast', desc: 'Melde dich an insgesamt 30 Tagen an' },
    visit_100: { title: 'Hundert Tage', desc: 'Melde dich an insgesamt 100 Tagen an' },
    visit_365: { title: 'Ein Jahr Sudoku', desc: 'Melde dich an insgesamt 365 Tagen an' },

    // 8 ~ 14. Logic & Perfection
    flawless_1: { title: 'Fehlerfreier Meister', desc: 'Löse ein Rätsel mit 0 Fehlern' },
    flawless_5: { title: 'Perfektionist', desc: 'Löse 5 Rätsel mit jeweils 0 Fehlern' },
    pure_logic_expert: { title: 'Reine Logik', desc: 'Lv.4 Schwer ohne Verwendung von Tipps abschließen' },
    pure_logic_master: { title: 'Ultimativer Geist', desc: 'Lv.5 Experte mit 0 Fehlern und 0 Tipps lösen' },
    note_master: { title: 'Notizen-Meister', desc: 'Nutze Bleistift-Notizen über 50-mal aktiv in Rätseln' },
    no_notes: { title: 'Intuitiver Blick', desc: 'Lv.3 Mittel oder höher ohne Bleistift-Notizen lösen' },
    fast_entry_fan: { title: 'Blitzschnell', desc: 'Ein Rätsel im Schnellmodus (Zahl-Zuerst) lösen' },

    // 15 ~ 19. Speed & Combos
    rank_s_plus: { title: 'Göttliches Tempo', desc: 'Erreiche den prestigeträchtigen 👑 S+ Rang' },
    speed_runner_3m: { title: 'Unter 3 Minuten', desc: 'Ein Rätsel in unter 3 Minuten (180s) lösen' },
    speed_runner_2m: { title: 'Geschwindigkeitsdämon', desc: 'Ein Rätsel in unter 2 Minuten (120s) lösen' },
    combo_streak_5: { title: 'Kombo-Künstler', desc: 'Erreiche eine 5er-Kombo im Zeitrennen-Modus' },
    combo_streak_10: { title: 'Kombo-Maestro', desc: 'Erreiche eine 10er-Kombo im Zeitrennen-Modus' },

    // 20 ~ 26. Difficulty & Survival
    clear_lv1: { title: 'Anfänger-Bezwinger', desc: 'Ein Rätsel der Stufe Lv.1 Einführung lösen' },
    clear_lv2: { title: 'Leicht-Meister', desc: 'Ein Rätsel der Stufe Lv.2 Einfach lösen' },
    clear_lv3: { title: 'Mittel gelöst', desc: 'Lv.3 Mittel-Rätsel lösen' },
    clear_lv4: { title: 'Experten-Deduktion', desc: 'Lv.4 Schwer-Rätsel lösen' },
    clear_lv5: { title: 'Großmeister', desc: 'Die höchste Stufe Lv.5 Experte lösen' },
    survival_hero: { title: 'Überlebensheld', desc: 'Den Zeitlimit-Überlebensmodus erfolgreich bestehen' },
    survival_clutch: { title: 'Knappe Flucht', desc: 'Mit 5 Sekunden oder weniger Restzeit abschließen' },

    // Killer (2026-10-08, D11)
    killer_first: { title: 'Erster Käfig', desc: 'Löse dein erstes Killer-Sudoku' },
    killer_lv3: { title: 'Summenprofi', desc: 'Löse ein Killer-Sudoku auf Lv.3 Mittel' },
    killer_win_25: { title: 'Käfigknacker', desc: 'Löse insgesamt 25 Killer-Sudokus' },
    killer_lv5: { title: 'Killer-Meister', desc: 'Löse ein Killer-Sudoku auf der höchsten Stufe Lv.5 Experte' },

    // 27 ~ 30. Daily, Battle & Brain IQ
    daily_first: { title: 'Täglicher Entdecker', desc: 'Löse dein erstes tägliches Rätsel' },
    daily_streak_7: { title: '7-Tage-Wunder', desc: 'Melde dich 7 Tage in Folge an' },
    battle_first_win: { title: 'Gladiatoren-Sieg', desc: 'Gewinne dein erstes 1v1-Duell oder KI-Match' },
    iq_150: { title: 'Logik-Meister', desc: 'Erreiche einen Logic Score von 135 oder mehr' },

    // The academy (2026-10-08, D11)
    academy_first_lesson: { title: 'Erste Lektion', desc: 'Löse eine Übung in der Sudoku-Akademie' },
    academy_stage3: { title: 'Wing-Meister', desc: 'Löse eine Übung zu jeder Technik aus Stufe 3 der Akademie' },
    academy_all: { title: 'Akademie-Abschluss', desc: 'Löse eine Übung zu jeder Technik der Sudoku-Akademie' }
  }
};
