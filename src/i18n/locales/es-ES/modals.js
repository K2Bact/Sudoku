/**
 * Spanish (es-ES / Español - España) Modal Strings
 */
export const modals = {
  modals: {
    victory: {
      title: '¡Puzle completado!',
      desc: '¡Enhorabuena!\nHas resuelto el Sudoku con éxito.',
      rankLabel: 'Calificación: {title}',
      difficultyLabel: 'Dificultad',
      timeLabel: 'Tiempo empleado',
      timeRemainingLabel: 'Tiempo restante',
      mistakesLabel: 'Fallos cometidos',
      mistakesCount: '{count} fallos',
      nextGame: 'Siguiente partida',
      leaderboardBtn: '🏆 Clasificación',
      shareBtn: 'Compartir',
      copiedToast: '🎉 ¡Resultado copiado al portapapeles!',
      shareText: '🧩 ¡He completado Sudoku {mode} Lv.{level} {name} en [{time}]! Rango: {rank} (Fallos: {mistakes}). ¡Pon a prueba tu mente!',
      ranks: {
        'S+': '👑 S+ (Velocidad Divina)',
        'S': '⭐️ S (Maestro)',
        'A': '🥇 A (Avanzado)',
        'B': '🥈 B (Competente)',
        'C': '🥉 C (Completado)'
      }
    },
    gameOver: {
      title: 'Fin de la partida',
      desc: 'Has alcanzado el límite de 3 fallos.\nPuedes continuar viendo un anuncio breve.',
      descNoRevive: 'Has alcanzado el límite de 3 fallos.\n(Oportunidad de revivir ya utilizada)',
      reviveBtn: 'Revivir (+1 vida)',
      restartBtn: 'Reiniciar'
    },
    newGame: {
      title: 'Seleccionar dificultad',
      desc: 'Elige el nivel de Sudoku\nque deseas desafiar.'
    },
    storeReview: {
      title: '¿Te gusta jugar a Sudoku?',
      desc: 'Tu valoración y comentario sincero\nnos ayudan muchísimo a seguir mejorando el juego. 💙',
      submitBtn: 'Dejar una reseña',
      laterBtn: 'Más tarde'
    },
    dailyReward: {
      title: '¡Recompensa diaria recibida!',
      streakBadge: 'Racha de {days} días',
      desc: '¡Día {days} consecutivo completado!\nHas recibido +{count} pista(s) gratis.',
      confirm: 'Recoger'
    },
    adReward: {
      dismissed: 'Mira el anuncio hasta el final para recibir la recompensa.',
      unavailable: 'Ahora mismo no hay anuncios disponibles.\nInténtalo de nuevo en un momento.'
    },
    hintReward: {
      title: 'Obtener pista gratis',
      desc: 'Mira un anuncio breve para recibir\n1 pista adicional de inmediato.',
      watchAd: 'Ver anuncio y obtener pista (+1)',
      adWatching: '📺 Reproduciendo anuncio…',
      adPlaceholder: '📺 Espacio de anuncio (sin anuncio)',
      chancesLeft: 'Recargas restantes: {remaining}/{max}',
      maxReached: 'Las recargas de pistas por anuncio están limitadas a 2 por partida.',
      later: 'Más tarde'
    }
  }
};
