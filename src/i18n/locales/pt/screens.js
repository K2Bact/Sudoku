export const screens = {
  game: {
    ghost: {
      ahead: '{time} à frente',
      behind: '{time} atrás',
      ghostHintNotice: '💡 Dica usada – este tempo não conta como recorde pessoal.'
    }
  },
  home: {
    scoreLabel: 'Logic Score',
    title: 'Sudoku',
    badge: 'PRO',
    hintTooltip: 'Dicas',
    brainReportTitle: 'Análise de jogo',
    brainPercentileShort: 'Puzzles concluídos: {won}',
    startSelectedLevel: 'Iniciar Lv.{level} {name}',
    modeTabs: { classic: 'Clássico', timeAttack: 'Contra o Tempo', timeLimit: 'Sobrevivência' },
    rivalModes: {
      standard: '🎯 Normal',
      ghost: '👻 Fantasma',
      delta: '⚡ Diferença',
      lockedToast: 'Conclua esta dificuldade pelo menos 1 vez para desbloquear.',
      timeLimitToast: "Fantasma e Diferença de tempo não estão disponíveis no modo Sobrevivência.",
      infoAria: "Sobre Fantasma e Diferença de tempo",
      infoGhost: "Rejoga o tabuleiro do recorde, disputando com a sua própria partida.",
      infoDelta: "Um tabuleiro novo, com a vantagem ou o atraso sobre o seu melhor ritmo.",
    },
    modes: {
      classic: { badge: 'CLÁSSICO', title: 'Solo Clássico', desc: 'Sudoku tradicional, calmo e envolvente', startBtn: 'Novo Jogo' },
      timeAttack: { badge: 'CONTRA O TEMPO', title: '⚡ Contra o Tempo', desc: 'Corra contra o relógio pelo menor tempo!', startBtn: 'Iniciar' },
      timeLimit: { badge: 'SOBREVIVÊNCIA', title: '⏳ Sobrevivência', desc: 'Lv.{level} com {minutes} min! Sobreviva antes do tempo acabar.', startBtn: 'Iniciar' },
      daily: { title: 'Desafio Diário', desc: 'Novo tabuleiro todo dia & insígnias mensais', badge: 'DIÁRIO' },
      battle: { title: 'Duelo 1v1 Online', desc: 'Partidas em tempo real' },
      aiBattle: { badge: 'VS IA', title: 'Duelo contra IA', desc: 'Desafio 1:1 de velocidade' },
      academy: { title: 'Academia Sudoku', desc: 'Aprenda 32 técnicas de mestre' },
      practice: { title: 'Treino Livre', desc: 'Erros ilimitados, jogo relaxante' }
    },
    nav: {brain: 'Análise', stats: 'Estatísticas', academy: 'Academia', settings: 'Ajustes' }
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
      beginnerLv1Title: '[Lv.1 Iniciação] 1 Sudoku', beginnerLv1Desc: 'Complete um jogo Lv.1 Iniciação para desenvolver a lógica básica.',
      beginnerLv2Title: '[Lv.2 Fácil] 1 Sudoku', beginnerLv2Desc: 'Complete um jogo Lv.2 Fácil para praticar técnicas fundamentais.',
      medLv3Title: '[Lv.3+ Médio] 1 Sudoku', medLv3Desc: 'Complete um jogo Lv.3 Médio ou superior para testar suas deduções.',
      advLv4Title: '[Lv.4+ Difícil] 1 Sudoku', advLv4Desc: 'Supere um jogo Lv.4 Difícil e prove seu raciocínio mestre.',
      advLv5Title: '[Lv.5 Especialista] 1 Sudoku', advLv5Desc: 'Complete o mais desafiador Lv.5 Especialista para alcançar a elite.',
      battleTitle: 'Jogar 1 Duelo 1v1 Online ou IA', battleDesc: 'Participe de 1 duelo em tempo real ou partida contra IA.',
      speedrunTitle: '⚡ Concluir 1 partida no Contra o Tempo', speedrunDesc: 'Complete um puzzle no modo Contra o Tempo.'
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
    restoreFail: 'Nenhuma compra anterior encontrada para restaurar.',
    buyFail: 'Não foi possível concluir a compra. Tente novamente mais tarde.'
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
      auto: 'Sistema'
    },
    gameplaySection: '🎮 Regras de Jogo',
    limitMistakes: 'Limite de 3 Erros (Corações)',
    limitMistakesDesc: "Fim de jogo ao cometer 3 erros. Desligado: os melhores tempos não são salvos",
    autoCheck: 'Verificação Automática de Erros',
    autoCheckDesc: 'Destacar números incorretos em vermelho imediatamente',
    soundSection: '🔊 Áudio & Vibração',
    soundFx: 'Efeitos Sonoros',
    soundFxDesc: 'Sons de digitação e toques nos botões',
    hapticFx: 'Resposta Tátil (Vibração)',
    hapticFxDesc: 'Vibrar ao acertar ou errar entradas',
    adPrivacyBtn: 'Privacidade dos anúncios',
    adPrivacyDesc: 'Altere a sua escolha sobre anúncios personalizados',
    resetData: 'Redefinir Todos os Dados Locais',
    resetDataDesc: 'Limpar estatísticas e histórico local',
    resetConfirm: '⚠️ Atenção: Todo o histórico, dicas e dados da análise de jogo serão permanentemente excluídos. Continuar?',
    resetSuccess: 'Dados redefinidos com sucesso.',
    privacySection: '🛡️ Privacidade & Segurança',
    privacyPolicyBtn: 'Privacidade',
    privacySubtitle: 'Proteção de privacidade',
    privacyModalTitle: 'Política de Privacidade',
    privacy: {
      subtitle: 'O Sudoku não exige conta. Veja o que o app realmente guarda e envia.',
      sec1Title: '1. Armazenamento e backup', sec1Desc: "Seus recordes, dicas e configurações ficam guardados no seu aparelho. Sem entrar no Play Games, eles ficam só neste aparelho. Nunca coletamos seu nome, e-mail, telefone, contatos ou localização.",
      sec2Title: '2. Google Play Games', sec2Desc: 'Enquanto você estiver conectado ao Play Games, cada vitória faz backup automático do seu progresso (estatísticas, conquistas, dicas, configurações) nos dados salvos do Play Games e envia seu Logic Score para um placar do Play Games. Esses dados ficam na sua própria conta Google.',
      sec3Title: '3. Duelos 1v1', sec3Desc: 'Os duelos 1v1 em tempo real usam o Google Firebase para enviar ao adversário um ID de jogador gerado aleatoriamente, um apelido automático (Player_xxxx) e seu progresso no sudoku. O ID fica guardado no aparelho e é reutilizado; ele não está ligado ao seu nome nem a nenhuma conta. Se os dois jogadores tiverem o compartilhamento de jogadas ativado, ao fim da partida também são enviadas ao adversário as jogadas daquela partida e seus tempos, para a revisão (ativado por padrão; você pode desativá-lo em Configurações).',
      sec4Title: '4. Anúncios e compras', sec4Desc: 'O app exibe anúncios pelo Google AdMob: um banner, um anúncio em tela cheia após uma vitória e vídeos premiados opcionais. O AdMob pode processar seu ID de publicidade. A compra Remover anúncios é processada pelo Google Play; nunca recebemos seus dados de pagamento.'
    }
  },
  stats: {
    classicBest: 'Melhor Clássico',
    speedrunBest: 'Melhor Contra o Tempo',
    survivalTitle: '⏳ Modo Sobrevivência',
    survivalTotalWins: 'Vitórias em Sobrevivência',
    survivalWinsUnit: '{count}',
    summaryTitle: 'Resumo de Desempenho',
    pvpRating: "Pontuação",
    pvpRecordLabel: "Histórico",
    pvpRecord: "{wins}V · {losses}D",
    totalPlayed: 'Total de Jogos',
    totalWon: 'Total de Vitórias',
    winRate: 'Taxa de Vitória'
  },
  brainReport: {
    scoreLabel: 'Logic Score',
    scoreHowTitle: "ⓘ Como o Logic Score é calculado?",
    scoreHowBody: "Ele sobe quando você preenche todo o tabuleiro e vence. Contam tanto as partidas Padrão quanto as Killer. O nível mais difícil vencido sem dicas é o que mais conta; o número de vitórias e a taxa de vitórias contam um pouco. Duelos 1v1 e contra IA não entram no número de vitórias nem na taxa de vitórias: eles têm um histórico próprio em Estatísticas. Fim de jogo e partidas abandonadas diminuem a taxa de vitórias e podem tirar alguns pontos. O placar usa essa pontuação quando você está conectado ao Play Games.",
    shareText: '[Análise de jogo Sudoku]\nLogic Score: {iq}\nNível: {tier}\nExperimente o Sudoku hoje!',
    copiedToast: 'Análise copiada para a área de transferência.',
    focus: 'Sem erros',
    durability: 'Dedicação',
    accuracy: 'Taxa de conclusão',
    logic: 'Dificuldade',
    speed: 'Velocidade',
    shareCardBtn: '🔗 Compartilhar',
    attributesTitle: '📈 5 métricas de jogo',
    title: 'Análise de jogo',
    shareTitle: 'Minha análise de jogo Sudoku',
    tiers: {
      grandMaster: '👑 Grão-Mestre',
      grandMasterDesc: 'Você alcançou a classificação mais alta.',
      expert: '🧠 Especialista',
      expertDesc: 'Você resolve quebra-cabeças difíceis com consistência.',
      superior: '⚡ Avançado',
      superiorDesc: 'Você está pronto para quebra-cabeças avançados.',
      aboveAverage: '💡 Intermediário',
      aboveAverageDesc: 'Você está melhorando sempre.',
      balanced: '🎯 Equilibrado',
      balancedDesc: 'Suas 5 métricas crescem de forma equilibrada.',
      developing: '🌱 Iniciante',
      developingDesc: 'Continue jogando e sua pontuação vai subir.'
    }
  },
  battleLobby: {
    title: 'Duelo 1v1 em Tempo Real',
    cancelBtn: 'Cancelar Busca',
    searching: 'Procurando um oponente...',
    autoMatchTitle: 'Partida Rápida',
    autoMatchDesc: 'Matchmaking ágil com jogadores de todo o mundo',
    mmrBadge: 'Sua taxa de conclusão: {rate}%',
    findOpponentBtn: 'Buscar Oponente',
    noOpponentFound: 'Nenhum oponente encontrado.',
    searchAgain: 'Procurar de novo',
    connectFailed: "Não foi possível conectar ao jogo online. Tente novamente mais tarde. Jogar contra a IA?",
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
    finalProgress: 'Progresso final',
    ratingChange: 'Variação de Pontuação MMR 1v1',
    aiModeLabel: 'Partida de Treino com IA (Lv.{level})',
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
    aiTag: 'IA',
    confirmLeave: 'Deseja desistir e retornar ao início?',
    emptyCellsLeft: 'restantes'
  },
  aiBattleScreen: {
    selectLevelTitle: 'Escolha o Nível da IA',
    selectLevelDesc: 'Selecione um oponente de IA adequado à sua habilidade.',
    aiSpeed: 'Velocidade: {speed}',
    level1Desc: 'Robô Iniciante: Resolve com calma para ajudar no aprendizado básico.',
    level2Desc: 'Robô Normal: Resolução firme com pouquíssimos erros.',
    level3Desc: 'Robô Habilidoso: Ritmo rápido e poucos erros.',
    level4Desc: 'Robô Especialista: Muito rápido e raros erros.',
    level5Desc: 'Robô Grão-Mestre: O robô mais rápido e com menos erros.',
    startBtn: 'Iniciar Duelo IA Lv.{level} {name}'
  },
  academy: {
    tabs: { stage1: 'Etapa 1', stage2: 'Etapa 2', stage3: 'Etapa 3', stage4: 'Etapa 4', stage5: 'Etapa 5' },
    stageTitles: {
      stage1: 'Etapa 1: Técnicas Básicas (Singles & Linhas)',
      stage2: 'Etapa 2: Técnicas Intermediárias (Pares & Interseções)',
      stage3: 'Etapa 3: Técnicas Avançadas (Família Wing)',
      stage4: 'Etapa 4: Técnicas de Mestre (Fish, Coloração & Retângulo Único)',
      stage5: 'Etapa 5: Técnicas de Grão-Mestre (AIC, ALS & Exocet)'
    },
    title: 'Academia Sudoku',
    theoryBoard: {
      patternTab: 'Padrão',
      resultTab: 'Resultado',
      patternCaption: 'As casas coloridas formam o padrão desta técnica. É o mesmo tabuleiro do Exemplo prático 1.',
      resultCaption: 'Os candidatos marcados em vermelho são removidos por este padrão.',
      placeCaption: 'Este padrão define o número destacado como resposta daquela casa.'
    },
    practiceUi: {
      theory: 'Teoria',
      practice1: 'Exercício 1',
      practice2: 'Exercício 2',
      success: 'Correto [{val}]! Técnica dominada com perfeição!',
      retry: 'Tentar Novamente',
      error: '[{val}] está incorreto. Verifique os dígitos iniciais!',
      prompt: '👇 Toque no número correspondente (?) no teclado numérico abaixo.',
      promptEliminated: '👇 Toque no candidato que é removido da casa alvo.'
    }
  },
  adBanner: {removeBtn: 'Sem Anúncios' }
};
