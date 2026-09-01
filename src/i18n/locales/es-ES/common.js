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
    newGame: 'Nueva partida',
    home: 'Inicio',
    save: 'Guardar',
    pause: 'Pausa',
    resume: 'Continuar',
    loading: 'Cargando...',
    error: 'Error',
    exitAppPrompt: 'Pulsa Atrás otra vez para salir de la aplicación.',
    confirmLeaveGame: '¿Deseas abandonar la partida y volver al inicio?'
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
    pauseTooltip: 'Pausar cronómetro',
    themeTooltip: 'Cambiar tema',
    soundOn: 'Silenciar',
    soundOff: 'Activar sonido'
  },
  keypad: {
    undo: 'Deshacer',
    erase: 'Borrar',
    notes: 'Notas',
    hint: 'Pista',
    fastEntry: 'Entrada rápida',
    fastEntryLocked: 'Fijar {number}'
  },
  board: {
    pausedTitle: 'Juego pausado',
    tapToResume: 'Toca la pantalla para continuar ▶️',
    resumeTooltip: 'Toca para continuar'
  },
  themes: {
    toast: '🎨 Tema cambiado a {name}',
    clay: '🏺 Cerámica y Arcilla',
    clayDesc: 'Teclas mates de arcilla cálida con textura 3D',
    matteDark: '🌌 Resina Oscura Mate',
    matteDarkDesc: 'Tono medianoche relajante para la vista',
    pureCeramic: '🧊 Cerámica Pura 3D',
    pureCeramicDesc: 'Elegantes teclas de porcelana blanca acolchada',
    editorial: '📰 Papel Clásico Suizo',
    editorialDesc: 'Diseño editorial sobrio con textura de papel'
  },
  conflicts: {
    boxes: [
      'Superior izquierda', 'Superior centro', 'Superior derecha',
      'Media izquierda', 'Centro', 'Media derecha',
      'Inferior izquierda', 'Inferior centro', 'Inferior derecha'
    ],
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
      desc: '¡Top {percentile}% de jugadores! Razonamiento deductivo de élite insuperable.'
    },
    mensa: {
      title: '🧠 Nivel Mensa',
      desc: '¡Top {percentile}% de jugadores! Extraordinaria capacidad de análisis lógico.'
    },
    superior: {
      title: '⚡ Mente Brillante',
      desc: '¡Top {percentile}% de jugadores! Gran agilidad y resolución lógica.'
    },
    aboveAverage: {
      title: '💡 Superior a la Media',
      desc: '¡Top {percentile}% de jugadores! Pensamiento flexible y deductivo sólido.'
    },
    balanced: {
      title: '🎯 Mente Equilibrada',
      desc: '¡Top {percentile}% de jugadores! Desarrollo óptimo de las 5 capacidades cognitivas.'
    },
    developing: {
      title: '🌱 En Entrenamiento',
      desc: 'Iniciando el entrenamiento cerebral con potencial de crecimiento ilimitado.'
    }
  }
};
