export const common = {
  common: {
    you: 'Você',
    back: 'Voltar',
    close: 'Fechar',
    confirm: 'OK',
    cancel: 'Cancelar',
    restart: 'Reiniciar',
    restartConfirm: 'Reiniciar este desafio?',
    newGame: 'Novo Jogo',
    home: 'Início',
    save: 'Salvar',
    pause: 'Pausar',
    resume: 'Continuar',
    loading: 'Carregando...',
    error: 'Erro',
    exitAppPrompt: 'Pressione Voltar novamente para sair do aplicativo.',
    confirmLeaveGame: 'Tem certeza de que deseja pausar e voltar ao início?',
    shareUnavailable: 'Não é possível compartilhar neste dispositivo.'
  },
  calendar: {
    days: {
      sun: 'D',
      mon: 'S',
      tue: 'T',
      wed: 'Q',
      thu: 'Q',
      fri: 'S',
      sat: 'S'
    }
  },
  levels: {
    1: 'Iniciação',
    2: 'Fácil',
    3: 'Médio',
    4: 'Difícil',
    5: 'Especialista'
  },
  header: {
    levelPrefix: 'Nv.{level}',
    mistakes: 'Erros {count}/{max}',
    mistakesUnlimited: 'Erros {count}',
    timeAttackMistake: 'Erro {count} (+10s)',
    combo: '🔥 {count} COMBO!',
    restartShort: 'Reiniciar',
    newGameShort: 'Novo Jogo',
    pauseTooltip: 'Pausar cronômetro',
    themeTooltip: 'Mudar tema',
    soundOn: 'Desativar som',
    soundOff: 'Ativar som'
  },
  keypad: {
    undo: 'Desfazer',
    erase: 'Apagar',
    notes: 'Anotações',
    hint: 'Dica',
    rewardHint: '+1 dica',
    fastEntry: 'Modo Rápido',
    fastEntryLocked: 'Fixado {number}'
  },
  board: {
    pausedTitle: 'Jogo Pausado',
    tapToResume: 'Toque para continuar ▶️',
    resumeTooltip: 'Toque para continuar'
  },
  themes: {
    toast: '🎨 Tema {name} aplicado',
    clay: '🏺 Cerâmica & Argila',
    clayDesc: 'Teclas de cerâmica fosca com física tátil 3D',
    matteDark: '🌌 Resina Escura Fosca',
    matteDarkDesc: 'Acabamento premium em resina com suave brilho noturno',
    pureCeramic: '🧊 Claymorphism Puro',
    pureCeramicDesc: 'Teclas arredondadas em cerâmica branca suave',
    editorial: '📰 Papel Jornal Clássico',
    editorialDesc: 'Tom de papel editorial suíço, limpo e suave para os olhos'
  },
  conflicts: {
    boxes: [
      'Superior-Esquerdo', 'Superior-Centro', 'Superior-Direito',
      'Meio-Esquerdo', 'Centro', 'Meio-Direito',
      'Inferior-Esquerdo', 'Inferior-Centro', 'Inferior-Direito'
    ],
    boxDuplicate: '⚠️ O número {num} já existe no [bloco 3x3 {box}]! {suffix}',
    rowDuplicate: '⚠️ O número {num} já existe na linha {row}! {suffix}',
    colDuplicate: '⚠️ O número {num} já existe na coluna {col}! {suffix}',
    multipleDuplicates: '⚠️ O número {num} já existe no mesmo bloco / linha / coluna! {suffix}',
    notSolution: '⚠️ O número {num} não é a solução correta para esta célula! {suffix}',
    boardFullHasMistakes: '⚠️ O tabuleiro está cheio, mas contém erros. Verifique novamente!',
    timeAttackSuffix: '(Erro {count} | penalidade de +10s)',
    classicSuffix: '(Erros {count}/3)'
  },
  tiers: {
    grandMaster: {
      title: '👑 Grão-Mestre',
      desc: 'Top {percentile}% dos jogadores! Raciocínio dedutivo de elite no topo de 1%.'
    },
    mensa: {
      title: '🧠 Nível Mensa',
      desc: 'Top {percentile}% dos jogadores! Capacidade lógica e analítica excepcional.'
    },
    superior: {
      title: '⚡ Lógica Superior',
      desc: 'Top {percentile}% dos jogadores! Intuição aguçada e brilhante resolução de problemas.'
    },
    aboveAverage: {
      title: '💡 Acima da Média',
      desc: 'Top {percentile}% dos jogadores! Pensamento analítico flexível e estável.'
    },
    balanced: {
      title: '🎯 Mente Equilibrada',
      desc: 'Top {percentile}% dos jogadores! Desenvolvimento harmonioso de todas as áreas cognitivas.'
    },
    developing: {
      title: '🌱 Treino Cerebral',
      desc: 'Fase inicial de treinamento com potencial infinito de crescimento.'
    }
  }
};
