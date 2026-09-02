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
      mistakesCount: '{count} Erros',
      nextGame: 'Próximo Jogo',
      leaderboardBtn: '🏆 Classificação',
      shareBtn: 'Compartilhar',
      copiedToast: '🎉 Resultado copiado para a área de transferência!',
      shareText: '🧩 Resolvi o Sudoku {mode} Nv.{level} {name} em [{time}]! Classificação: {rank} ({mistakes} erros). Desafie seu QI cerebral!',
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
      laterBtn: 'Depois',
      thankYou: '💙 Obrigado pelo apoio! Abrindo a página da loja.'
    },
    dailyReward: {
      title: 'Recompensa Diária!',
      desc: 'Sequência de {days} dias atingida!\n+1 Dica gratuita adicionada.',
      confirm: 'Receber'
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
