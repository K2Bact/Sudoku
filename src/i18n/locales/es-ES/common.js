/**
 * Spanish (es-ES / Español - España) Common Strings
 */
export const common = {
  common: {
    you: "Tú",
    back: 'Atrás',
    close: 'Cerrar',
    confirm: 'Aceptar',
    cancel: 'Cancelar',
    restart: 'Reiniciar',
    restartConfirm: "¿Reiniciar este sudoku? La partida actual contará como derrota.",
    abandonConfirm: "Hay una partida en curso. Si empiezas otra, contará como derrota. ¿Empezar igualmente?",
    newGame: 'Nueva partida',
    home: 'Inicio',
    pause: 'Pausa',
    resume: 'Continuar',
    exitAppPrompt: 'Pulsa Atrás otra vez para salir de la aplicación.',
    confirmLeaveGame: '¿Deseas abandonar la partida y volver al inicio?',
    shareUnavailable: 'No se puede compartir en este dispositivo.'
  },
  calendar: {
    days: {
      sun: 'D',
      mon: 'L',
      tue: 'M',
      wed: 'X',
      thu: 'J',
      fri: 'V',
      sat: 'S'
    }
  },
  levels: {
    1: 'Fácil',
    2: 'Medio',
    3: 'Difícil',
    4: 'Experto',
    5: 'Maestro'
  },
  header: {
    levelPrefix: 'Lv.{level}',
    mistakes: 'Fallos {count}/{max}',
    mistakesUnlimited: 'Fallos {count}',
    timeAttackMistake: 'Fallo {count} (+10s)',
    combo: '🔥 ¡{count} COMBO!',
    restartShort: 'Reiniciar',
    newGameShort: 'Nueva partida',
    themeTooltip: 'Cambiar tema',
    soundOn: 'Silenciar',
    soundOff: 'Activar sonido'
  },
  keypad: {
    undo: 'Deshacer',
    erase: 'Borrar',
    notes: 'Notas',
    hint: 'Pista',
    rewardHint: '+1 pista',
    fastEntry: 'Entrada rápida'
  },
  board: {
    pausedTitle: 'Juego pausado',
    tapToResume: 'Toca la pantalla para continuar ▶️',
    resumeTooltip: 'Toca para continuar'
  },
  themes: {
    clay: '🏺 Cerámica y Arcilla',
    matteDark: '🌌 Resina Oscura Mate',
    pureCeramic: '🧊 Cerámica Pura 3D',
    editorial: '📰 Papel Clásico Suizo'
  },
  conflicts: {
    boxDuplicate: '⚠️ ¡El número {num} ya está en el cuadrante [{box}]! {suffix}',
    rowDuplicate: '⚠️ ¡El número {num} ya existe en la fila {row}! {suffix}',
    colDuplicate: '⚠️ ¡El número {num} ya existe en la columna {col}! {suffix}',
    multipleDuplicates: '⚠️ ¡El número {num} coincide en fila, columna y cuadrante! {suffix}',
    notSolution: '⚠️ ¡El número {num} no es correcto para esta casilla! {suffix}',
    boardFullHasMistakes: '⚠️ El tablero está completo pero hay casillas erróneas.',
    timeAttackSuffix: '(Fallo {count} | +10s penalización)',
    classicSuffix: '(Fallos {count}/3)'
  },
  tiers: {
    grandMaster: {
      title: '👑 Gran Maestro',
      desc: 'Has alcanzado el rango más alto.'
    },
    expert: {
      title: '🧠 Experto',
      desc: 'Resuelves puzles difíciles con constancia.'
    },
    superior: {
      title: '⚡ Avanzado',
      desc: 'Estás listo para puzles avanzados.'
    },
    aboveAverage: {
      title: '💡 Intermedio',
      desc: 'Mejoras paso a paso.'
    },
    balanced: {
      title: '🎯 Equilibrado',
      desc: 'Tus 5 métricas crecen de forma equilibrada.'
    },
    developing: {
      title: '🌱 Principiante',
      desc: 'Sigue jugando y tu puntuación subirá.'
    }
  }
};
