export const achievements = {
  achievements: {
    categories: {
      all: 'Tous',
      progression: 'Progression',
      logic: 'Sans faute',
      speed: 'Vitesse',
      difficulty: 'Difficulté',
      special: 'Quotidien & Duel'
    },
    unlockedToast: 'Succès déverrouillé !',
    tabTitle: 'Succès',
    openPlayGames: 'Voir mes succès dans Play Jeux',
    statsTab: 'Stats',
    unlockedCount: '{unlocked} / {total} débloqué(s) ({pct}%)',
    lockedBadge: 'Verrouillé',
    pointsTotal: '{count} pts',
    tiers: { bronze: 'Bronze', silver: 'Argent', gold: 'Or', diamond: 'Diamant', master: 'Maître' },
    unlockedAt: 'Débloqué : {date}',

    // 1 ~ 7. Progression & Wins
    first_win: { title: 'Premier pas', desc: 'Résolvez votre toute première grille de Sudoku dans n’importe quelle difficulté' },
    win_5: { title: 'Cinq sur cinq', desc: 'Complétez un total de 5 grilles de Sudoku' },
    win_10: { title: 'Passion des casse-tête', desc: 'Complétez un total de 10 grilles de Sudoku' },
    win_25: { title: 'Médaille d’argent', desc: 'Complétez un total de 25 grilles de Sudoku' },
    win_50: { title: 'Vétéran d’or', desc: 'Complétez un total de 50 grilles de Sudoku' },
    win_100: { title: 'Club des 100', desc: 'Complétez un total de 100 grilles de Sudoku' },
    win_250: { title: 'Légende du Sudoku', desc: 'Complétez un total de 250 grilles de Sudoku' },

    // Days checked in, in all (2026-10-08, D11)
    visit_30: { title: 'Fidélité', desc: 'Connectez-vous 30 jours au total' },
    visit_100: { title: 'Cent jours', desc: 'Connectez-vous 100 jours au total' },
    visit_365: { title: 'Une année de sudoku', desc: 'Connectez-vous 365 jours au total' },

    // 8 ~ 14. Logic & Perfection
    flawless_1: { title: 'Maître sans faute', desc: 'Résolvez une grille avec 0 erreur' },
    flawless_5: { title: 'Perfectionniste', desc: 'Résolvez 5 grilles avec 0 erreur chacune' },
    pure_logic_expert: { title: 'Pure logique', desc: 'Terminez Lv.4 Difficile sans utiliser d’indice' },
    pure_logic_master: { title: 'Esprit ultime', desc: 'Terminez Lv.5 Expert avec 0 erreur et 0 indice' },
    note_master: { title: 'Maître des notes', desc: 'Utilisez activement les notes au crayon plus de 50 fois' },
    no_notes: { title: 'Œil intuitif', desc: 'Terminez Lv.3 Moyen ou supérieur sans utiliser de notes au crayon' },
    fast_entry_fan: { title: 'Vitesse éclair', desc: 'Terminez une grille en mode rapide (chiffre d’abord)' },

    // 15 ~ 19. Speed & Séries
    rank_s_plus: { title: 'Vitesse divine', desc: 'Obtenez le prestigieux rang 👑 S+' },
    speed_runner_3m: { title: 'Moins de 3 minutes', desc: 'Résolvez une grille en moins de 3 minutes (180s)' },
    speed_runner_2m: { title: 'Démon de la vitesse', desc: 'Résolvez une grille en moins de 2 minutes (120s)' },
    combo_streak_5: { title: 'Artiste du combo', desc: 'Atteignez un combo de 5 en mode Contre-la-montre' },
    combo_streak_10: { title: 'Maestro du combo', desc: 'Atteignez un combo de 10 en mode Contre-la-montre' },

    // 20 ~ 26. Difficulty & Survival
    clear_lv1: { title: 'Première conquête', desc: 'Terminez une grille Lv.1 Initiation' },
    clear_lv2: { title: 'Facile maîtrisé', desc: 'Terminez une grille Lv.2 Facile' },
    clear_lv3: { title: 'Moyen maîtrisé', desc: 'Terminez une grille Lv.3 Moyen' },
    clear_lv4: { title: 'Déduction experte', desc: 'Terminez une grille Lv.4 Difficile' },
    clear_lv5: { title: 'Grand Maître', desc: 'Terminez la difficulté maximale Lv.5 Expert' },
    survival_hero: { title: 'Héros de la survie', desc: 'Terminez une grille en mode Survie' },
    survival_clutch: { title: 'Échappée belle', desc: 'Terminez avec 5 secondes ou moins au chrono' },

    // Killer (2026-10-08, D11)
    killer_first: { title: 'Première cage', desc: 'Terminez votre premier Sudoku Killer' },
    killer_lv3: { title: 'As des sommes', desc: 'Terminez un Sudoku Killer Lv.3 Moyen' },
    killer_win_25: { title: 'Briseur de cages', desc: 'Terminez un total de 25 grilles de Sudoku Killer' },
    killer_lv5: { title: 'Maître du Killer', desc: 'Terminez un Sudoku Killer Lv.5 Expert — la difficulté maximale' },

    // 27 ~ 30. Daily, Battle & Brain IQ
    daily_first: { title: 'Explorateur quotidien', desc: 'Terminez votre premier défi quotidien' },
    daily_streak_7: { title: 'Semaine parfaite', desc: 'Connectez-vous 7 jours d’affilée' },
    battle_first_win: { title: 'Victoire de gladiateur', desc: 'Remportez votre premier duel 1v1 ou contre l’IA' },
    iq_150: { title: 'Maître de la logique', desc: 'Atteignez un Logic Score de 135 ou plus' },

    // The academy (2026-10-08, D11)
    academy_first_lesson: { title: 'Première leçon', desc: 'Réussissez un exercice de l’Académie Sudoku' },
    academy_stage3: { title: 'Maître des Wings', desc: 'Réussissez un exercice pour chaque technique de l’étape 3' },
    academy_all: { title: 'Diplôme de l’Académie', desc: 'Réussissez un exercice pour chaque technique de l’Académie Sudoku' }
  }
};
