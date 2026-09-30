export const modals = {
  modals: {
    victory: {
      title: 'Quebra-Cabeça Resolvido!',
      desc: 'Parabéns!\nVocê resolveu o tabuleiro com sucesso.',
      rankLabel: 'Classificação: {title}',
      difficultyLabel: 'Dificuldade',
      timeLabel: 'Tempo Decorrido',
      timeRemainingLabel: 'Tempo Restante',
      mistakesLabel: 'Erros',
      mistakesCount: '{count}',
      notRecordedHint: "Você usou dicas, então este tempo não conta como recorde.",
      notRecordedNoLimit: "Você jogou sem o limite de 3 erros, então este tempo não conta como recorde.",
      nextGame: 'Próximo Jogo',
      leaderboardBtn: "📊 Meus recordes",
      shareBtn: 'Compartilhar',
      copiedToast: '🎉 Resultado copiado para a área de transferência!',
      shareText: '🧩 Resolvi o Sudoku {mode} Lv.{level} {name} em [{time}]! Classificação: {rank} (erros: {mistakes}). Consegue fazer melhor?',
      ranks: {
        'S+': '👑 S+ (Divino)',
        'S': '⭐️ S (Mestre)',
        'A': '🥇 A (Profissional)',
        'B': '🥈 B (Habilidoso)',
        'C': '🥉 C (Concluído)'
      }
    },
    gameOver: {
      title: 'Fim de Jogo',
      desc: 'Você cometeu 3 erros.\nAssista a um anúncio para reviver e continuar!',
      descNoRevive: 'Todos os erros foram usados.\n(Chance de reviver já utilizada)',
      reviveBtn: 'Reviver (+1 vida)',
      restartBtn: 'Reiniciar'
    },
    newGame: {
      title: 'Selecionar Dificuldade',
      desc: 'Escolha o seu nível\npara o novo jogo.'
    },
    storeReview: {
      title: 'Gostando do Sudoku?',
      desc: 'Sua avaliação e feedback sinceros ajudam\nmuito a melhorar o jogo para todos! 💙',
      submitBtn: 'Avaliar',
      laterBtn: 'Depois'
    },
    dailyReward: {
      title: 'Recompensa Diária!',
      streakBadge: 'Sequência de {days} dia(s)',
      desc: 'Sequência de {days} dia(s) atingida!\n+{count} dica(s) gratuita(s) adicionada(s).',
      confirm: 'Receber'
    },
    adReward: {
      dismissed: 'Assista ao anúncio até o fim para receber a recompensa.',
      unavailable: 'Nenhum anúncio disponível no momento.\nTente novamente em instantes.'
    },
    hintReward: {
      title: 'Recarregar Dicas Grátis',
      desc: 'Assista a um vídeo curto para\nreceber +1 dica imediatamente.',
      watchAd: 'Assistir Anúncio (+1 Dica)',
      adWatching: '📺 A reproduzir anúncio…',
      adPlaceholder: '📺 Espaço de anúncio (sem anúncio)',
      chancesLeft: 'Recargas restantes neste jogo: {remaining}/{max}',
      maxReached: 'Recargas por anúncio limitadas a 2 por partida.',
      later: 'Mais tarde'
    }
  }
};
