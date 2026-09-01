import fs from 'fs';
import path from 'path';

const ptDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales/pt';

// 1. Update achievements.js
const achPath = path.join(ptDir, 'achievements.js');
if (fs.existsSync(achPath)) {
  let a = fs.readFileSync(achPath, 'utf8');
  a = a.replace(/special:\s*['"]Diário & Duelo['"]/g, "special: 'Diário e 1v1'");
  a = a.replace(/statsTab:\s*['"]Estatísticas['"]/g, "statsTab: 'Dados'");
  a = a.replace(/title:\s*['"]Conquistador Iniciante['"]/g, "title: 'Primeira Conquista'");
  a = a.replace(/desc:\s*['"]Conclua o tabuleiro Nv\.1 Iniciante['"]/g, "desc: 'Conclua o tabuleiro Nv.1 Muito Fácil'");
  a = a.replace(/title:\s*['"]Mestre Fácil['"]/g, "title: 'Fácil Superado'");
  fs.writeFileSync(achPath, a, 'utf8');
  console.log('✅ Updated pt/achievements.js');
}

// 2. Update modals.js
const modPath = path.join(ptDir, 'modals.js');
if (fs.existsSync(modPath)) {
  let m = fs.readFileSync(modPath, 'utf8');
  m = m.replace(/leaderboardBtn:\s*['"]🏆 Ver Classificação Global['"]/g, "leaderboardBtn: '🏆 Classificação'");
  m = m.replace(/reviveBtn:\s*['"]Assistir Anúncio \(\+1 vida\)['"]/g, "reviveBtn: 'Reviver (+1 vida)'");
  m = m.replace(/submitBtn:\s*['"]Avaliar na Play Store['"]/g, "submitBtn: 'Avaliar'");
  m = m.replace(/laterBtn:\s*['"]Talvez mais tarde['"]/g, "laterBtn: 'Depois'");
  m = m.replace(/confirm:\s*['"]Receber Recompensa['"]/g, "confirm: 'Receber'");
  fs.writeFileSync(modPath, m, 'utf8');
  console.log('✅ Updated pt/modals.js');
}

// 3. Update screens.js
const scrPath = path.join(ptDir, 'screens.js');
if (fs.existsSync(scrPath)) {
  let s = fs.readFileSync(scrPath, 'utf8');

  // Home
  s = s.replace(/ghost:\s*['"]👻 Fantasma PB['"]/g, "ghost: '👻 Fantasma'");
  s = s.replace(/delta:\s*['"]⚡ Ritmo Delta['"]/g, "delta: '⚡ Diferença'");
  s = s.replace(/timeAttack:\s*\{\s*badge:\s*['"]CONTRA O TEMPO['"],\s*title:\s*['"]⚡ Contra o Tempo['"],\s*desc:\s*['"][^'"]+['"],\s*startBtn:\s*['"]Iniciar Contra o Tempo['"]\s*\}/g,
    "timeAttack: { badge: 'CONTRA O TEMPO', title: '⚡ Contra o Tempo', desc: 'Corra contra o relógio pelo menor tempo!', startBtn: 'Iniciar' }");
  s = s.replace(/timeLimit:\s*\{\s*badge:\s*['"]SOBREVIVÊNCIA['"],\s*title:\s*['"]⏳ Sobrevivência['"],\s*desc:\s*['"][^'"]+['"],\s*startBtn:\s*['"]Iniciar Sobrevivência['"]\s*\}/g,
    "timeLimit: { badge: 'SOBREVIVÊNCIA', title: '⏳ Sobrevivência', desc: 'Nv.{level} com {minutes} min! Sobreviva antes do tempo acabar.', startBtn: 'Iniciar' }");

  // Daily
  s = s.replace(/badgeTitle:\s*['"]Insígnia Mestre de \{month\}['"]/g, "badgeTitle: 'Mestre {month}'");
  s = s.replace(/badgeDesc:\s*['"]\{completed\} \/ \{target\} concluídos \(Meta: 15\+\)['"]/g, "badgeDesc: '{completed}/{target} · Meta 15'");
  s = s.replace(/unlockModalTitle:\s*['"]Desbloquear Desafio Anterior['"]/g, "unlockModalTitle: 'Desafio anterior'");
  s = s.replace(/unlockModalConfirmBtn:\s*['"]📺 Assistir Anúncio & Desbloquear['"]/g, "unlockModalConfirmBtn: '📺 Assistir & Abrir'");
  s = s.replace(/beginnerLv1Title:\s*['"]\[Nv\.1 Muito Fácil\] Concluir 1 Sudoku['"]/g, "beginnerLv1Title: '[Nv.1 Muito Fácil] 1 Sudoku'");
  s = s.replace(/beginnerLv2Title:\s*['"]\[Nv\.2 Fácil\] Concluir 1 Sudoku['"]/g, "beginnerLv2Title: '[Nv.2 Fácil] 1 Sudoku'");
  s = s.replace(/medLv3Title:\s*['"]\[Nv\.3\+ Médio\] Concluir 1 Sudoku['"]/g, "medLv3Title: '[Nv.3+ Médio] 1 Sudoku'");
  s = s.replace(/advLv4Title:\s*['"]\[Nv\.4\+ Difícil\] Concluir 1 Sudoku['"]/g, "advLv4Title: '[Nv.4+ Difícil] 1 Sudoku'");
  s = s.replace(/advLv5Title:\s*['"]\[Nv\.5 Especialista\] Concluir 1 Sudoku['"]/g, "advLv5Title: '[Nv.5 Mestre] 1 Sudoku'");
  s = s.replace(/advLv5Desc:\s*['"]Complete o difícil Nv\.5 Especialista para alcançar a elite\.['"]/g, "advLv5Desc: 'Complete o mais desafiador Nv.5 Mestre para alcançar a elite.'");

  // RemoveAds
  s = s.replace(/heroTitle:\s*['"]Aproveite a Experiência Pura de Sudoku['"]/g, "heroTitle: 'Sudoku sem interrupções'");
  s = s.replace(/benefitsTitle:\s*['"]👑 Vantagens da Assinatura Premium['"]/g, "benefitsTitle: '👑 Vantagens Premium'");
  s = s.replace(/benefit1:\s*['"]Remoção definitiva de todos os banners e anúncios['"]/g, "benefit1: 'Remoção definitiva de banners e anúncios intersticiais'");
  s = s.replace(/buyBtn:\s*['"]Versão Sem Anúncios \(\{price\}\)['"]/g, "buyBtn: 'Sem Anúncios ({price})'");
  s = s.replace(/purchaseBtn:\s*['"]Remover Anúncios Definitivamente \(\{price\}\)['"]/g, "purchaseBtn: 'Remover Anúncios ({price})'");
  s = s.replace(/restoreBtn:\s*['"]Restaurar Compras['"]/g, "restoreBtn: 'Restaurar'");
  s = s.replace(/alreadyPurchased:\s*['"]Você já possui a Assinatura Premium! 🎉['"]/g, "alreadyPurchased: 'Você já tem o acesso Premium! 🎉'");

  // Tutorial
  s = s.replace(/step1Title:\s*['"]🎯 Passo 1: Selecionar célula & Inserir número['"]/g, "step1Title: '🎯 Passo 1: Inserir número'");
  s = s.replace(/finishBtn:\s*['"]Iniciar Jogo Real['"]/g, "finishBtn: 'Começar a jogar'");

  // Settings & Privacy
  s = s.replace(/privacyPolicyBtn:\s*['"]Ver Política de Privacidade['"]/g, "privacyPolicyBtn: 'Privacidade'");
  s = s.replace(/privacySubtitle:\s*['"]Privacidade Protegida['"]/g, "privacySubtitle: 'Proteção Zero-PII'");
  s = s.replace(/segue estritamente o princípio \./g, 'segue estritamente o princípio Zero-PII.');
  s = s.replace(/sec2Title:\s*['"]2\. Armazenamento Local & Direitos de Exclusão['"]/g, "sec2Title: '2. Dados locais e exclusão'");
  s = s.replace(/tempos de conclusão são usados no matchmaking/g, 'registros de conclusão são usados no matchmaking');
  s = s.replace(/sec4Title:\s*['"]4\. Serviços de Publicidade \(Google AdMob\)['"]/g, "sec4Title: '4. Publicidade (Google AdMob)'");

  // Stats
  s = s.replace(/leaderboardNotice:\s*['"]Veja os rankings globais em tempo real com o Google Play Games\.['"]/g, "leaderboardNotice: 'Veja as classificações globais em tempo real com o Google Play Games.'");
  s = s.replace(/leaderboardBtn:\s*['"]🌐 🏆 Ver Classificações Globais['"]/g, "leaderboardBtn: '🏆 Classificações'");
  s = s.replace(/leaderboardTab:\s*['"]Classificação['"]/g, "leaderboardTab: 'Ranking'");
  s = s.replace(/tabs:\s*\{\s*stats:\s*['"]Estatísticas['"],\s*achievements:\s*['"]Conquistas['"]\s*\}/g, "tabs: { stats: 'Dados', achievements: 'Conquistas' }");
  s = s.replace(/startFirstBtn:\s*['"]Iniciar 1º Sudoku 🚀['"]/g, "startFirstBtn: '1º Sudoku 🚀'");

  // BrainReport
  s = s.replace(/focus:\s*['"]Concentração Profonda['"]/g, "focus: 'Concentração'");
  s = s.replace(/durability:\s*['"]Resistência de Foco['"]/g, "durability: 'Resistência'");
  s = s.replace(/logic:\s*['"]Raciocínio Lógico['"]/g, "logic: 'Lógica'");
  s = s.replace(/speed:\s*['"]Velocidade de Processamento['"]/g, "speed: 'Velocidade'");
  s = s.replace(/shareCardBtn:\s*['"]🔗 Compartilhar Análise Cerebral['"]/g, "shareCardBtn: '🔗 Compartilhar'");
  s = s.replace(/shareBtn:\s*['"]Compartilhar Relatório['"]/g, "shareBtn: 'Compartilhar'");

  // BattleResult & AI Battle
  s = s.replace(/\{opponent\} foi desqualificado após 3 erros\. Você venceu!/g, '{opponent} está fora após 3 erros. Você venceu!');
  s = s.replace(/Você foi desqualificado após cometer 3 erros\./g, 'Você está fora após cometer 3 erros.');
  s = s.replace(/disqualified:\s*['"]💀 Eliminado['"]/g, "disqualified: '💀 Fora'");
  s = s.replace(/aiLobbyBtn:\s*['"]Menu de Duelos IA['"]/g, "aiLobbyBtn: 'Duelos IA'");

  // Academy
  s = s.replace(/stageTitles:\s*\{[\s\S]*?\},/g, `stageTitles: {
      stage1: 'Etapa 1: Técnicas Básicas (Singles & Linhas)',
      stage2: 'Etapa 2: Técnicas Intermediárias (Pares & Interseções)',
      stage3: 'Etapa 3: Técnicas Avançadas (Família Wing)',
      stage4: 'Etapa 4: Técnicas Especialistas (Fish, Coloração & Retângulo Único)',
      stage5: 'Etapa 5: Técnicas Mestre (Cadeias AIC, ALS & Exocet)'
    },`);

  s = s.replace(/stage1:\s*['"]Etapa 1:[^'"]+['"],/g, "stage1: 'Etapa 1: Técnicas Básicas (Singles & Linhas)',");
  s = s.replace(/stage2:\s*['"]Etapa 2:[^'"]+['"],/g, "stage2: 'Etapa 2: Técnicas Intermediárias (Pares & Interseções)',");
  s = s.replace(/stage3:\s*['"]Etapa 3:[^'"]+['"],/g, "stage3: 'Etapa 3: Técnicas Avançadas (Família Wing)',");
  s = s.replace(/stage4:\s*['"]Etapa 4:[^'"]+['"],/g, "stage4: 'Etapa 4: Técnicas Especialistas (Fish, Coloração & Retângulo Único)',");
  s = s.replace(/stage5:\s*['"]Etapa 5:[^'"]+['"],/g, "stage5: 'Etapa 5: Técnicas Mestre (Cadeias AIC, ALS & Exocet)',");
  s = s.replace(/Verifique os dígitos em destaque!/g, 'Verifique os dígitos iniciais!');

  fs.writeFileSync(scrPath, s, 'utf8');
  console.log('✅ Updated pt/screens.js');
}
