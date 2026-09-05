export const screens = {
  game: {
    ghost: {
      ahead: '{time} à frente',
      behind: '{time} atrás',
      ghostHintNotice: '💡 O uso de dicas desqualifica a atualização do recorde PB.'
    }
  },
  home: {
    title: 'Sudoku',
    badge: 'PRO',
    hintTooltip: 'Dicas',
    brainReportTitle: 'Análise Cerebral',
    brainPercentileShort: 'Top {percentile}% · {won} Vitórias',
    startSelectedLevel: 'Iniciar Nv.{level} {name}',
    modeTabs: { classic: 'Clássico', timeAttack: 'Contra o Tempo', timeLimit: 'Sobrevivência' },
    rivalModes: {
      standard: '🎯 Padrão',
      ghost: '👻 Fantasma',
      delta: '⚡ Diferença',
      lockedToast: 'Conclua esta dificuldade pelo menos 1 vez para desbloquear.'
    },
    modes: {
      classic: { badge: 'CLÁSSICO', title: 'Solo Clássico', desc: 'Sudoku tradicional, calmo e envolvente', startBtn: 'Novo Jogo' },
      timeAttack: { badge: 'CONTRA O TEMPO', title: '⚡ Contra o Tempo', desc: 'Corra contra o relógio pelo menor tempo!', startBtn: 'Iniciar' },
      timeLimit: { badge: 'SOBREVIVÊNCIA', title: '⏳ Sobrevivência', desc: 'Nv.{level} com {minutes} min! Sobreviva antes do tempo acabar.', startBtn: 'Iniciar' },
      daily: { title: 'Desafio Diário', desc: 'Novo tabuleiro todo dia & insígnias mensais', badge: 'NOVO' },
      battle: { title: 'Duelo 1v1 Online', desc: 'Partidas em tempo real' },
      aiBattle: { title: 'Duelo contra IA', desc: 'Desafio 1:1 de velocidade' },
      academy: { title: 'Academia Sudoku', desc: 'Aprenda 32 técnicas de mestre' },
      practice: { title: 'Treino Livre', desc: 'Erros ilimitados, jogo relaxante' }
    },
    nav: {brain: 'QI Cerebral', stats: 'Estatísticas', academy: 'Academia', settings: 'Ajustes' }
  },
  daily: {
    header: 'Desafios Diários ({month})',
    badgeTitle: 'Mestre {month}',
    badgeDesc: '{completed}/{target} · Meta 15',
    unlockingAd: '📺 Desbloqueando desafio anterior...',
    calendarTitle: '📅 Calendário 365 Dias',
    futureAlert: 'Os desafios futuros ainda não foram liberados.',
    pastUnlockNotice: '💡 Dias anteriores perdidos (🔒) podem ser liberados assistindo a um vídeo curto.',
    unlockModalTitle: 'Desafio anterior',
    unlockModalDesc: 'O desafio de {date} é de um dia anterior.\nAssista a um anúncio rápido para desbloquear e jogar.\nDeseja assistir?',
    unlockModalConfirmBtn: '📺 Assistir & Abrir',
    unlockModalCancelBtn: 'Cancelar',
    missionCardTitle: '🎯 Missão Especial de Hoje',
    missionCompleted: 'Missão de hoje concluída! ✅',
    missionStartBtn: 'Iniciar Missão 🚀',
    missionReward: '+1 Dica & Presença',
    tiers: { beginner: 'Iniciante', intermediate: 'Intermediário', advanced: 'Mestre' },
    missions: {
      beginnerLv1Title: '[Nv.1 Muito Fácil] 1 Sudoku', beginnerLv1Desc: 'Complete um jogo Nv.1 Muito Fácil para desenvolver a lógica básica.',
      beginnerLv2Title: '[Nv.2 Fácil] 1 Sudoku', beginnerLv2Desc: 'Complete um jogo Nv.2 Fácil para praticar técnicas fundamentais.',
      medLv3Title: '[Nv.3+ Médio] 1 Sudoku', medLv3Desc: 'Complete um jogo Nv.3 Médio ou superior para testar suas deduções.',
      advLv4Title: '[Nv.4+ Difícil] 1 Sudoku', advLv4Desc: 'Supere um jogo Nv.4 Difícil e prove seu raciocínio mestre.',
      advLv5Title: '[Nv.5 Mestre] 1 Sudoku', advLv5Desc: 'Complete o mais desafiador Nv.5 Mestre para alcançar a elite.',
      battleTitle: 'Jogar 1 Duelo 1v1 Online ou IA', battleDesc: 'Participe de 1 duelo em tempo real ou partida contra IA.',
      speedrunTitle: '⚡ Concluir 1 modo Contra o Tempo', speedrunDesc: 'Complete um puzzle no modo Contra o Tempo aproveitando combos.'
    }
  },
  removeAds: {
    title: 'Remover Anúncios & Premium',
    heroTitle: 'Sudoku sem interrupções',
    heroDesc: 'Remova permanentemente os banners inferiores e anúncios de tela cheia.',
    benefitsTitle: '👑 Vantagens Premium',
    benefit1: 'Remoção definitiva de banners e anúncios intersticiais',
    benefit2: 'Foco máximo e economia de bateria no seu aparelho',
    benefit3: 'Apoio a desenvolvedores independentes e futuras atualizações',
    buyBtn: 'Sem Anúncios ({price})',
    restoreBtn: 'Restaurar',
    alreadyPurchased: 'Você já tem o acesso Premium! 🎉',
    processing: '💳 Processando...',
    purchaseBtn: 'Remover Anúncios',
    buySuccess: 'Compra concluída com sucesso! Muito obrigado.',
    restoreSuccess: 'Compras restauradas com sucesso.',
    restoreFail: 'Nenhuma compra anterior encontrada para restaurar.'
  },
  tutorialOverlay: {
    exitTooltip: 'Sair do tutorial',
    step1Title: '🎯 Passo 1: Inserir número',
    step1Desc: 'Toque na célula em destaque [Linha 1, Col 3] e digite [9] no teclado!',
    step2Title: '✏️ Passo 2: Anotações a lápis (Candidatos)',
    step2Desc: 'Ative [Anotações] na barra e marque o candidato [3] nesta célula!',
    step3Title: '🔒 Passo 3: Modo Rápido (Número primeiro)',
    step3Desc: 'Fixe o número [4] e toque rapidamente nas células vazias para preenchê-las!',
    step4Title: '🎉 Passo 4: Tutorial Concluído!',
    step4Desc: 'Parabéns! Você aprendeu a inserir números, fazer anotações e usar o modo rápido.',
    finishBtn: 'Começar a jogar',
    nextBtn: 'Próximo Passo'
  },
  settings: {
    title: 'Configurações',
    themeSection: '🎨 Tema Visual',
    languageSection: '🌐 Idioma',
    languages: {
      auto: 'Padrão do Sistema'
    },
    gameplaySection: '🎮 Regras de Jogo',
    limitMistakes: 'Limite de 3 Erros (Corações)',
    limitMistakesDesc: 'Fim de jogo ao cometer 3 erros',
    autoCheck: 'Verificação Automática de Erros',
    autoCheckDesc: 'Destacar números incorretos em vermelho imediatamente',
    soundSection: '🔊 Áudio & Vibração',
    soundFx: 'Efeitos Sonoros',
    soundFxDesc: 'Sons de digitação e toques nos botões',
    hapticFx: 'Resposta Tátil (Vibração)',
    hapticFxDesc: 'Vibrar ao acertar ou errar entradas',
    resetData: 'Redefinir Todos os Dados Locais',
    resetDataDesc: 'Limpar estatísticas e histórico local',
    resetConfirm: '⚠️ Atenção: Todo o histórico, dicas e estatísticas cerebrais serão permanentemente excluídos. Continuar?',
    resetSuccess: 'Dados redefinidos com sucesso.',
    privacySection: '🛡️ Privacidade & Segurança',
    privacyPolicyBtn: 'Privacidade',
    privacySubtitle: 'Proteção de privacidade',
    privacyModalTitle: 'Política de Privacidade',
    privacy: {
      subtitle: 'O Sudoku não exige conta e não coleta nome, e-mail nem dados de contato.',
      sec1Title: '1. Sem cadastro', sec1Desc: 'Este app não requer cadastro e não coleta seu nome, e-mail, telefone, contatos ou localização. Os recursos online — duelos 1v1 e backup na nuvem — enviam apenas um identificador gerado aleatoriamente.',
      sec2Title: '2. Dados locais e exclusão', sec2Desc: 'Progresso, dicas e temas são armazenados em segurança apenas no seu aparelho.',
      sec3Title: '3. Duelos 1v1 & Índice Cerebral', sec3Desc: 'Os duelos 1v1 em tempo real enviam um identificador de jogador gerado aleatoriamente e registros de conclusão. O identificador fica salvo no seu aparelho e é reutilizado, e não está vinculado ao seu nome nem a uma conta.',
      sec4Title: '4. Publicidade (Google AdMob)', sec4Desc: 'Para manter o jogo gratuito, esta aplicação pode mostrar anúncios através do SDK Google AdMob. Quando a publicidade está ativa, o AdMob pode recolher um identificador de publicidade. A versão atual não exibe anúncios.'
    }
  },
  stats: {
    classicBest: 'Melhor Clássico',
    speedrunBest: 'Melhor Contra o Tempo',
    survivalTitle: '⏳ Modo Sobrevivência',
    survivalTotalWins: 'Vitórias em Sobrevivência',
    survivalWinsUnit: '{count} Vitórias',
    leaderboardTab: 'Ranking',
    summaryTitle: 'Resumo de Desempenho',
    totalPlayed: 'Total de Jogos',
    totalWon: 'Total de Vitórias',
    winRate: 'Taxa de Vitória'
  },
  brainReport: {
    totalPlayed: 'Total de Jogos',
    totalWon: 'Jogos Vencidos',
    winRate: 'Taxa de Vitória',
    shareText: '[Relatório de QI Sudoku]\nMeu QI Sudoku: {iq} ({percentile})\nNível: {tier}\nDesafie seu cérebro com o Sudoku hoje!',
    copiedToast: 'Relatório de análise cerebral copiado.',
    focus: 'Concentração Profunda',
    durability: 'Resistência',
    accuracy: 'Precisão',
    logic: 'Lógica',
    speed: 'Velocidade',
    shareCardBtn: '🔗 Compartilhar',
    overallStats: '📊 Estatísticas Gerais Acumuladas',
    attributesTitle: '🧠 5 Pilares Cognitivos',
    title: 'Relatório de QI Cerebral',
    percentilePrefix: 'Top ',
    shareTitle: 'Meu Relatório de QI Sudoku',
    tiers: {
      grandMaster: '👑 Grão-Mestre',
      grandMasterDesc: 'Top {percentile}% de todos os jogadores! Raciocínio dedutivo de elite no topo de 1%.',
      mensa: '🧠 Nível Mensa',
      mensaDesc: 'Top {percentile}% de todos os jogadores! Capacidade lógica e analítica excepcional.',
      superior: '⚡ Mente Superior',
      superiorDesc: 'Top {percentile}% de todos os jogadores! Intuição aguçada e brilhante resolução de problemas.',
      aboveAverage: '💡 Acima da Média',
      aboveAverageDesc: 'Top {percentile}% de todos os jogadores! Pensamento analítico flexível e estável.',
      balanced: '🎯 Mente Equilibrada',
      balancedDesc: 'Top {percentile}% de todos os jogadores! Desenvolvimento harmonioso de todas as 5 áreas cognitivas.',
      developing: '🌱 Mente em Evolução',
      developingDesc: 'Fase inicial de treino. Seu índice cognitivo crescerá a cada partida!'
    }
  },
  battleLobby: {
    title: 'Duelo 1v1 em Tempo Real',
    cancelBtn: 'Cancelar Busca',
    searching: 'Procurando um oponente digno...',
    autoMatchTitle: 'Partida Rápida',
    autoMatchDesc: 'Matchmaking ágil com jogadores de todo o mundo',
    mmrBadge: 'Partida por nível · Vitórias: {rate}%',
    findOpponentBtn: 'Buscar Oponente',
    noOpponentFound: 'Nenhum oponente encontrado. Jogar contra a IA?',
    playAiInstead: 'Jogar contra a IA'
  },
  battleResult: {
    victoryTitle: 'Vitória no Duelo 1v1!',
    defeatTitle: 'Derrota no Duelo 1v1',
    aiVictoryTitle: 'Vitória contra IA!',
    aiDefeatTitle: 'Derrota contra IA',
    victoryDesc: 'Você completou o tabuleiro primeiro e venceu {opponent}!',
    victoryMistakeDesc: '{opponent} está fora após 3 erros. Você venceu!',
    defeatDesc: '{opponent} completou o tabuleiro primeiro.',
    defeatMistakeDesc: 'Você está fora após cometer 3 erros.',
    disqualified: '💀 Fora',
    ratingChange: 'Variação de Pontuação MMR 1v1',
    aiModeLabel: 'Partida de Treino com IA (Nv.{level})',
    aiWonBadge: 'Treino Vencido',
    aiLostBadge: 'Treino Finalizado',
    you: 'Você',
    opponent: 'Oponente',
    lobbyBtn: 'Saguão de Duelos',
    aiLobbyBtn: 'Duelos IA',
    rematchBtn: 'Pedir Revanche',
    aiRematchBtn: 'Jogar Novamente',
    rematchWaitingBtn: 'Aguardando... ({seconds}s)',
    rematchAcceptedToast: '🎉 Revanche aceita! Novo jogo começando.',
    rematchRejectedToast: 'O oponente recusou a revanche.',
    rematchOpponentLeftToast: 'O oponente saiu da sala.',
    homeBtn: 'Início'
  },
  rematchToast: {
    title: '{opponent} solicitou uma revanche!',
    countdown: '{seconds}s',
    acceptBtn: 'Aceitar',
    declineBtn: 'Recusar'
  },
  battleHeader: {
    confirmLeave: 'Deseja desistir e retornar ao início?',
    emptyCellsLeft: 'restantes'
  },
  aiBattleScreen: {
    selectLevelTitle: 'Escolha o Nível da IA',
    selectLevelDesc: 'Selecione um oponente de IA adequado à sua habilidade.',
    aiSpeed: 'Velocidade: {speed}',
    level1Desc: 'Robô Iniciante: Resolve com calma para ajudar no aprendizado básico.',
    level2Desc: 'Robô Normal: Resolução firme com pouquíssimos erros.',
    level3Desc: 'Robô Habilidoso: Ritmo rápido utilizando táticas intermediárias.',
    level4Desc: 'Robô Especialista: Muito rápido aplicando estratégias avançadas.',
    level5Desc: 'AlphaDoku: IA Grão-Mestre com velocidade extrema de resolução.',
    startBtn: 'Iniciar Duelo IA Nv.{level} {name}'
  },
  academy: {
    tabs: { stage1: 'Etapa 1', stage2: 'Etapa 2', stage3: 'Etapa 3', stage4: 'Etapa 4', stage5: 'Etapa 5' },
    stageTitles: {
      stage1: 'Etapa 1: Técnicas Básicas (Singles & Linhas)',
      stage2: 'Etapa 2: Técnicas Intermediárias (Pares & Interseções)',
      stage3: 'Etapa 3: Técnicas Avançadas (Família Wing)',
      stage4: 'Etapa 4: Técnicas Especialistas (Fish, Coloração & Retângulo Único)',
      stage5: 'Etapa 5: Técnicas Mestre (Cadeias AIC, ALS & Exocet)'
    },
    title: 'Academia Sudoku',
    practiceUi: {
      theory: 'Teoria',
      practice1: 'Exercício 1',
      practice2: 'Exercício 2',
      success: 'Correto [{val}]! Técnica dominada com perfeição!',
      retry: 'Tentar Novamente',
      error: '[{val}] está incorreto. Verifique os dígitos iniciais!',
      prompt: '👇 Toque no número correspondente (?) no teclado numérico abaixo.'
    }
  },
  adBanner: {removeBtn: 'Sem Anúncios' }
};
