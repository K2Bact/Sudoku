export const achievements = {
  achievements: {
    categories: {
      all: 'Todas',
      progression: 'Progresso',
      logic: 'Perfeição',
      speed: 'Velocidade',
      difficulty: 'Dificuldade',
      special: 'Diário e 1v1'
    },
    unlockedToast: 'Conquista desbloqueada!',
    tabTitle: 'Conquistas',
    statsTab: 'Dados',
    unlockedCount: '{unlocked} / {total} Desbloqueadas ({pct}%)',
    lockedBadge: 'Bloqueada',
    pointsTotal: '{count} pts',
    tiers: { bronze: 'Bronze', silver: 'Prata', gold: 'Ouro', diamond: 'Diamante', master: 'Mestre' },
    unlockedAt: 'Desbloqueada em: {date}',

    // 1 ~ 7. Progresso
    first_win: { title: 'Primeiro Passo', desc: 'Conclua seu primeiro Sudoku em qualquer dificuldade' },
    win_5: { title: 'Toca Aqui', desc: 'Conclua um total de 5 quebra-cabeças de Sudoku' },
    win_10: { title: 'Entusiasta de Sudoku', desc: 'Conclua um total de 10 quebra-cabeças de Sudoku' },
    win_25: { title: 'Desafiante de Prata', desc: 'Conclua um total de 25 quebra-cabeças de Sudoku' },
    win_50: { title: 'Veterano de Ouro', desc: 'Conclua um total de 50 quebra-cabeças de Sudoku' },
    win_100: { title: 'Clube dos 100', desc: 'Conclua um total de 100 quebra-cabeças de Sudoku' },
    win_250: { title: 'Lenda do Sudoku', desc: 'Conclua um total de 250 quebra-cabeças de Sudoku' },

    // Days checked in, in all (2026-10-08, D11)
    visit_30: { title: 'Presença constante', desc: 'Entre no jogo em 30 dias no total' },
    visit_100: { title: 'Cem dias', desc: 'Entre no jogo em 100 dias no total' },
    visit_365: { title: 'Um ano de sudoku', desc: 'Entre no jogo em 365 dias no total' },

    // 8 ~ 14. Lógica e Perfeição
    flawless_1: { title: 'Mestre Sem Erros', desc: 'Resolva um tabuleiro com 0 erros' },
    flawless_5: { title: 'Perfeccionista', desc: 'Resolva 5 tabuleiros com 0 erros cada' },
    pure_logic_expert: { title: 'Lógica Pura', desc: 'Conclua o Lv.4 Difícil sem usar nenhuma dica' },
    pure_logic_master: { title: 'Mente Suprema', desc: 'Conclua o Lv.5 Especialista com 0 erros e 0 dicas' },
    note_master: { title: 'Mestre das Anotações', desc: 'Utilize anotações a lápis 50+ vezes ativamente' },
    no_notes: { title: 'Olhar Intuitivo', desc: 'Conclua o Lv.3 Médio ou superior sem usar anotações' },
    fast_entry_fan: { title: 'Relâmpago', desc: 'Conclua um jogo no Modo Rápido (Número primeiro)' },

    // 15 ~ 19. Velocidade
    rank_s_plus: { title: 'Velocidade da Luz', desc: 'Alcance a classificação de elite 👑 S+' },
    speed_runner_3m: { title: 'Menos de 3 Minutos', desc: 'Resolva um tabuleiro em menos de 3 minutos (180s)' },
    speed_runner_2m: { title: 'Velocidade Máxima', desc: 'Resolva um tabuleiro em menos de 2 minutos (120s)' },
    combo_streak_5: { title: 'Artista do Combo', desc: 'Atinja um combo de 5 no modo Contra o Tempo' },
    combo_streak_10: { title: 'Maestro do Combo', desc: 'Atinja um combo de 10 no modo Contra o Tempo' },

    // 20 ~ 26. Dificuldade & Sobrevivência
    clear_lv1: { title: 'Primeira Conquista', desc: 'Conclua o tabuleiro Lv.1 Iniciação' },
    clear_lv2: { title: 'Fácil Superado', desc: 'Conclua o tabuleiro Lv.2 Fácil' },
    clear_lv3: { title: 'Médio Resolvido', desc: 'Conclua o tabuleiro Lv.3 Médio' },
    clear_lv4: { title: 'Dedução Especialista', desc: 'Conclua o tabuleiro Lv.4 Difícil' },
    clear_lv5: { title: 'Grão-Mestre', desc: 'Conclua o nível mais alto Lv.5 Especialista' },
    survival_hero: { title: 'Herói da Sobrevivência', desc: 'Sobreviva e conclua o modo Limite de Tempo' },
    survival_clutch: { title: 'Fuga Épica', desc: 'Conclua com 5 segundos ou menos restantes no relógio' },

    // Killer (2026-10-08, D11)
    killer_first: { title: 'Primeira gaiola', desc: 'Conclua seu primeiro Sudoku Killer' },
    killer_lv3: { title: 'Craque das somas', desc: 'Conclua um Sudoku Killer Lv.3 Médio' },
    killer_win_25: { title: 'Quebra-gaiolas', desc: 'Conclua um total de 25 Sudoku Killer' },
    killer_lv5: { title: 'Mestre do Killer', desc: 'Conclua um Sudoku Killer Lv.5 Especialista — o nível mais alto' },

    // 27 ~ 30. Diário & Duelos
    daily_first: { title: 'Explorador Diário', desc: 'Conclua seu primeiro Desafio Diário' },
    daily_streak_7: { title: 'Milagre de 7 Dias', desc: 'Entre no jogo 7 dias seguidos' },
    battle_first_win: { title: 'Gladiador Vitorioso', desc: 'Vença seu primeiro duelo 1v1 online ou contra a IA' },
    iq_150: { title: 'Mestre da lógica', desc: 'Alcance um Logic Score de 135 ou mais' },

    // The academy (2026-10-08, D11)
    academy_first_lesson: { title: 'Primeira lição', desc: 'Resolva um exercício da Academia Sudoku' },
    academy_stage3: { title: 'Mestre dos Wings', desc: 'Resolva um exercício de cada técnica da Etapa 3' },
    academy_all: { title: 'Formatura na Academia', desc: 'Resolva um exercício de cada técnica da Academia Sudoku' }
  }
};
