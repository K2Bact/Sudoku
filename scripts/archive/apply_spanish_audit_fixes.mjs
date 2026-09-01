import fs from 'fs';
import path from 'path';

const esDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales/es-ES';

// 1. Update common.js
const comPath = path.join(esDir, 'common.js');
if (fs.existsSync(comPath)) {
  let c = fs.readFileSync(comPath, 'utf8');
  c = c.replace(/confirm:\s*['"]Confirmar['"]/, `confirm: 'Aceptar'`);
  fs.writeFileSync(comPath, c, 'utf8');
  console.log('✅ Updated es-ES/common.js');
}

// 2. Update achievements.js
const achPath = path.join(esDir, 'achievements.js');
if (fs.existsSync(achPath)) {
  let a = fs.readFileSync(achPath, 'utf8');

  // Title / Category Sentence Case
  a = a.replace(/¡Logro Desbloqueado!/g, '¡Logro desbloqueado!');
  a = a.replace(/Sin Fallos/g, 'Sin fallos');
  a = a.replace(/statsTab:\s*['"][^'"]+['"]/, `statsTab: 'Datos'`);

  // Difficulty fixes in achievements
  a = a.replace(/title:\s*['"]Conquistador Fácil['"]/, `title: 'Conquistador principiante'`);
  a = a.replace(/desc:\s*['"]Completa un sudoku en nivel Lv\.1 Fácil\.['"]/, `desc: 'Completa un sudoku en nivel Lv.1 Principiante.'`);
  
  a = a.replace(/title:\s*['"]Experto en Medio['"]/, `title: 'Maestro del nivel Fácil'`);
  a = a.replace(/desc:\s*['"]Completa un sudoku en nivel Lv\.2 Medio\.['"]/, `desc: 'Completa un sudoku en nivel Lv.2 Fácil.'`);

  a = a.replace(/title:\s*['"]Ascenso a Difícil['"]/, `title: 'Ascenso a Medio'`);
  a = a.replace(/desc:\s*['"]Completa un sudoku en nivel Lv\.3 Difícil\.['"]/, `desc: 'Completa un sudoku en nivel Lv.3 Medio.'`);

  a = a.replace(/desc:\s*['"]Completa un sudoku en nivel Lv\.4 Experto\.['"]/, `desc: 'Completa un sudoku en nivel Lv.4 Difícil.'`);
  a = a.replace(/desc:\s*['"]Completa un sudoku en nivel Lv\.4 Experto sin usar pistas\.['"]/, `desc: 'Completa un sudoku en nivel Lv.4 Difícil sin usar pistas.'`);
  a = a.replace(/desc:\s*['"]Completa un sudoku en nivel Lv\.3 Difícil o superior sin usar notas\.['"]/, `desc: 'Completa un sudoku en nivel Lv.3 Medio o superior sin usar notas.'`);

  a = a.replace(/title:\s*['"]Experto en puzles de plata['"]/, `title: 'Puzle de plata'`);
  a = a.replace(/title:\s*['"]Gran Maestro Supremo['"]/, `title: 'Gran Maestro'`);

  fs.writeFileSync(achPath, a, 'utf8');
  console.log('✅ Updated es-ES/achievements.js');
}

// 3. Update leaderboard.js & modals.js
const ldrPath = path.join(esDir, 'leaderboard.js');
if (fs.existsSync(ldrPath)) {
  let l = fs.readFileSync(ldrPath, 'utf8');
  l = l.replace(/Mi Posición Actual/g, 'Mi posición actual');
  l = l.replace(/Mi Récord/g, 'Mi récord');
  l = l.replace(/Clasificación Clásica/g, 'Clasificación clásica');
  l = l.replace(/IQ Cerebral/g, 'IQ cerebral');
  l = l.replace(/Salón de la Fama/g, 'Salón de la fama');
  fs.writeFileSync(ldrPath, l, 'utf8');
  console.log('✅ Updated es-ES/leaderboard.js');
}

const modPath = path.join(esDir, 'modals.js');
if (fs.existsSync(modPath)) {
  let m = fs.readFileSync(modPath, 'utf8');
  m = m.replace(/leaderboardBtn:\s*['"]🏆 Ver clasificación mundial['"]/, `leaderboardBtn: '🏆 Clasificación'`);
  m = m.replace(/shareBtn:\s*['"]Compartir resultado['"]/, `shareBtn: 'Compartir'`);
  m = m.replace(/confirm:\s*['"]Recoger recompensa['"]/, `confirm: 'Recoger'`);
  m = m.replace(/restartBtn:\s*['"]Reiniciar partida['"]/, `restartBtn: 'Reiniciar'`);
  m = m.replace(/reviveBtn:\s*['"]Ver anuncio y revivir \(\+1 vida\)['"]/, `reviveBtn: 'Revivir (+1 vida)'`);
  m = m.replace(/¿Aceptas el reto\?/g, '¡Pon a prueba tu mente!');
  fs.writeFileSync(modPath, m, 'utf8');
  console.log('✅ Updated es-ES/modals.js');
}

// 4. Update screens.js
const scrPath = path.join(esDir, 'screens.js');
if (fs.existsSync(scrPath)) {
  let s = fs.readFileSync(scrPath, 'utf8');

  // Home Nav & Titles
  s = s.replace(/Nueva Partida/g, 'Nueva partida');
  s = s.replace(/Desafío Diario/g, 'Desafío diario');
  s = s.replace(/Duelo 1v1 Online/g, 'Duelo 1v1 online');
  s = s.replace(/Práctica Libre/g, 'Práctica libre');
  s = s.replace(/Análisis Cerebral/g, 'Análisis cerebral');
  s = s.replace(/Calendario de 365 Días/g, 'Calendario de 365 días');
  s = s.replace(/Misión Personalizada de Hoy/g, 'Misión personalizada de hoy');
  s = s.replace(/Temas Visuales/g, 'Temas visuales');
  s = s.replace(/Reglas de Juego/g, 'Reglas de juego');
  s = s.replace(/Gestión de Datos/g, 'Gestión de datos');
  s = s.replace(/Privacidad y Seguridad/g, 'Privacidad y seguridad');
  s = s.replace(/Partidas Jugadas/g, 'Partidas jugadas');
  s = s.replace(/Partidas Ganadas/g, 'Partidas ganadas');
  s = s.replace(/Ratio de Victoria/g, 'Tasa de victoria');
  s = s.replace(/Resumen de Rendimiento/g, 'Resumen de rendimiento');
  s = s.replace(/Sala de Duelos/g, 'Sala de duelos');
  s = s.replace(/Menú Principal/g, 'Menú principal');
  s = s.replace(/Puzzles Completados/g, 'Puzles completados');
  s = s.replace(/brain:\s*['"]Cerebro['"]/, `brain: 'IQ'`);

  // Daily missions Lv.5 Maestro
  s = s.replace(/advLv5Title:\s*['"]\[Lv\.5 Experto\][^'"]+['"]/, `advLv5Title: '[Lv.5 Maestro] Supera 1 Sudoku'`);
  s = s.replace(/advLv5Desc:\s*['"][^'"]+['"]/, `advLv5Desc: 'Resuelve 1 partida en el nivel más alto, Maestro.'`);
  s = s.replace(/unlockModalConfirmBtn:\s*['"][^'"]+['"]/, `unlockModalConfirmBtn: '📺 Ver y desbloquear'`);
  s = s.replace(/badgeTitle:\s*['"]Insignia de Maestro de \{month\}['"]/, `badgeTitle: 'Maestro de {month}'`);
  s = s.replace(/badgeDesc:\s*['"][^'"]+['"]/, `badgeDesc: '{completed}/{target} · Meta 15'`);

  // Remove Ads
  s = s.replace(/buyBtn:\s*['"]Eliminar Anuncios Para Siempre \(\{price\}\)['"]/, `buyBtn: 'Sin anuncios ({price})'`);
  s = s.replace(/purchaseBtn:\s*['"]Eliminar Anuncios Para Siempre \(\{price\}\)['"]/, `purchaseBtn: 'Eliminar anuncios ({price})'`);
  s = s.replace(/restoreBtn:\s*['"]Restaurar Compras Anteriores['"]/, `restoreBtn: 'Restaurar compras'`);
  s = s.replace(/Apoyo al equipo de desarrollo/g, 'Apoyo a los desarrolladores independientes');
  s = s.replace(/banners inferiores y anuncios a pantalla completa\./g, 'banners inferiores y los intersticiales al terminar la partida.');
  s = s.replace(/Ventajas de la Membresía Premium/g, 'Ventajas del acceso Premium');
  s = s.replace(/¡Ya posees la Membresía Premium!/g, '¡Ya tienes el acceso Premium!');

  // Tutorial
  s = s.replace(/finishBtn:\s*['"]Iniciar Partida Real['"]/, `finishBtn: 'Empezar a jugar'`);

  // Settings & Privacy
  s = s.replace(/privacySubtitle:\s*['"][^'"]+['"]/, `privacySubtitle: 'Protección Zero-PII'`);
  s = s.replace(/privacyPolicyBtn:\s*['"][^'"]+['"]/, `privacyPolicyBtn: 'Política de privacidad'`);
  s = s.replace(/utilizan tokens anónimos temporales\./g, 'utilizan tokens anónimos temporales y registros de finalización.');

  // Stats
  s = s.replace(/rankingHeader:\s*['"]🏆 Clasificaciones y Récords['"]/, `rankingHeader: '🏆 Clasificaciones mundiales'`);
  s = s.replace(/leaderboardBtn:\s*['"]🌐 🏆 Ver Clasificación Global['"]/, `leaderboardBtn: '🏆 Clasificación global'`);
  s = s.replace(/startFirstBtn:\s*['"][^'"]+['"]/, `startFirstBtn: 'Primer sudoku 🚀'`);
  s = s.replace(/leaderboardTab:\s*['"]Clasificación['"]/, `leaderboardTab: 'Ranking'`);
  s = s.replace(/survivalWinsUnit:\s*['"]\{count\} Éxitos['"]/, `survivalWinsUnit: '{count} logrados'`);
  s = s.replace(/tabs:\s*\{ stats:\s*['"]Estadísticas['"], achievements:\s*['"]Logros['"] \}/, `tabs: { stats: 'Datos', achievements: 'Logros' }`);

  // BrainReport
  s = s.replace(/shareTitle:\s*['"]Mi Informe de Coeficiente Sudoku['"]/, `shareTitle: 'Mi informe de Sudoku IQ'`);
  s = s.replace(/title:\s*['"]Informe de Rendimiento Cerebral['"]/, `title: 'Informe de Sudoku IQ'`);
  s = s.replace(/shareCardBtn:\s*['"]🔗 Compartir Informe Cerebral['"]/, `shareCardBtn: '🔗 Compartir informe'`);
  s = s.replace(/focus:\s*['"]Concentración Profunda['"]/, `focus: 'Concentración'`);
  s = s.replace(/durability:\s*['"]Resistencia de Enfoque['"]/, `durability: 'Resistencia'`);
  s = s.replace(/logic:\s*['"]Razonamiento Lógico['"]/, `logic: 'Lógica'`);
  s = s.replace(/speed:\s*['"]Velocidad de Procesamiento['"]/, `speed: 'Velocidad'`);

  // BattleLobby & BattleResult & AIBattle
  s = s.replace(/cancelBtn:\s*['"]Cancelar Emparejamiento['"]/, `cancelBtn: 'Cancelar'`);
  s = s.replace(/rematchBtn:\s*['"]Solicitar Revancha['"]/, `rematchBtn: 'Revancha'`);
  s = s.replace(/disqualified:\s*['"]💀 Descalificado['"]/, `disqualified: '💀 Fuera'`);
  s = s.replace(/startBtn:\s*['"]Iniciar Duelo Lv\.\{level\} \{name\} vs IA['"]/, `startBtn: 'Duelo Lv.{level} vs {name}'`);
  s = s.replace(/level1Desc:\s*['"]Bot Fácil: resuelve lentamente para que aprendas lo básico\.['"]/, `level1Desc: 'Bot Principiante: resuelve lentamente para que aprendas lo básico.'`);

  // Academy
  s = s.replace(/stageTitles:\s*\{[\s\S]*?stage5:[^}]+\}/, `stageTitles: {
      stage1: 'Etapa 1: Técnicas Básicas (Singles y líneas)',
      stage2: 'Etapa 2: Técnicas Intermedias (Pares e Intersecciones)',
      stage3: 'Etapa 3: Técnicas Avanzadas (Familia Wing)',
      stage4: 'Etapa 4: Técnicas Expertas (Peces, Coloreado y Rectángulo Único)',
      stage5: 'Etapa 5: Técnicas Maestras (Cadenas AIC, ALS y Exocet)'
    }`);
  s = s.replace(/error:\s*['"]¡Revisa las pistas resaltadas!['"]/, `error: '¡Revisa las cifras iniciales!'`);

  fs.writeFileSync(scrPath, s, 'utf8');
  console.log('✅ Updated es-ES/screens.js');
}
