export const common = {
  common: {
    you: 'Você',
    back: 'Voltar',
    close: 'Fechar',
    confirm: 'OK',
    cancel: 'Cancelar',
    restart: 'Reiniciar',
    restartConfirm: "Reiniciar este quebra-cabeça? O jogo atual contará como derrota.",
    abandonConfirm: "Há um jogo em andamento. Começar outro fará com que ele conte como derrota. Começar mesmo assim?",
    newGame: 'Novo Jogo',
    home: 'Início',
    pause: 'Pausar',
    resume: 'Continuar',
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
    levelPrefix: 'Lv.{level}',
    mistakes: 'Erros {count}/{max}',
    mistakesUnlimited: 'Erros {count}',
    timeAttackMistake: 'Erro {count} (+10s)',
    combo: '🔥 {count} COMBO!',
    restartShort: 'Reiniciar',
    newGameShort: 'Novo Jogo',
    themeTooltip: 'Mudar tema',
    soundOn: 'Desativar som',
    soundOff: 'Ativar som'
  },
  keypad: {
    undo: 'Desfazer',
    erase: 'Apagar',
    notes: 'Anotações',
    notesOn: 'Anotações ON',
    notesOff: 'Anotações OFF',
    hint: 'Dica',
    rewardHint: '+1 dica',
    fastEntry: 'Modo Rápido'
  },
  board: {
    pausedTitle: 'Jogo Pausado',
    tapToResume: 'Toque para continuar ▶️',
    resumeTooltip: 'Toque para continuar'
  },
  themes: {
    clay: '🏺 Cerâmica & Argila',
    matteDark: '🌌 Resina Escura Fosca',
    pureCeramic: '🧊 Claymorphism Puro',
    editorial: '📰 Papel Jornal Clássico'
  },
  conflicts: {
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
      desc: 'Você alcançou a classificação mais alta.'
    },
    expert: {
      title: '🧠 Especialista',
      desc: 'Você resolve quebra-cabeças difíceis com consistência.'
    },
    superior: {
      title: '⚡ Avançado',
      desc: 'Você está pronto para quebra-cabeças avançados.'
    },
    aboveAverage: {
      title: '💡 Intermediário',
      desc: 'Você está melhorando sempre.'
    },
    balanced: {
      title: '🎯 Equilibrado',
      desc: 'Suas 5 métricas crescem de forma equilibrada.'
    },
    developing: {
      title: '🌱 Iniciante',
      desc: 'Continue jogando e sua pontuação vai subir.'
    }
  }
};
