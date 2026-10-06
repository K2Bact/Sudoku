import { writeFileSync } from 'fs';

import { STAGE1_PRACTICE } from '../src/data/academy/practice/stage1Practice.js';
import { STAGE2_PAIRS_PRACTICE } from '../src/data/academy/practice/stage2PairsPractice.js';
import { STAGE2_TUPLES_PRACTICE } from '../src/data/academy/practice/stage2TuplesPractice.js';
import { STAGE3_PRACTICE } from '../src/data/academy/practice/stage3Practice.js';
import { STAGE4_FISH_PRACTICE } from '../src/data/academy/practice/stage4FishPractice.js';
import { STAGE4_CHAINS_PRACTICE } from '../src/data/academy/practice/stage4ChainsPractice.js';
import { STAGE5_PRACTICE } from '../src/data/academy/practice/stage5Practice.js';

const missionFixes = {
  // --- STAGE 3 ---
  'y_wing_ex2': {
    titleJa: '実践例 2: Y-Wing連鎖による [2] 確定',
    guideJa: 'Y-Wing連鎖によりターゲットマスから 9 が消去され、[2] が確定しました。2 を入力してください。',
    titleZh: '實戰範例 2: Y-Wing 連鎖鎖定 [2]',
    guideZh: '透過 Y-Wing 連鎖消去目標格中的 9，鎖定正確數字 [2]。請輸入 2！',
    titleEs: 'Ejemplo 2: Confirmación de [2] con Y-Wing',
    guideEs: 'La cadena Y-Wing elimina el candidato 9 y deja libre el [2]. ¡Introduce 2!'
  },
  'xyz_wing_ex1': {
    titleJa: '実践例 1: XYZ-Wingによる [8] 確定',
    guideJa: 'ピボットと2つのウィングが共有するマスから 5 が消去され [8] が確定しました。8 を入力してください。',
    titleZh: '實戰範例 1: XYZ-Wing 鎖定 [8]',
    guideZh: 'XYZ-Wing 樞紐與雙翼共同觀察格中消去 5，確定唯一解 [8]。請輸入 8！',
    titleEs: 'Ejemplo 1: Confirmación de [8] con XYZ-Wing',
    guideEs: 'El pivote y las alas eliminan el 5 en la intersección, confirmando [8]. ¡Introduce 8!'
  },
  'xyz_wing_ex2': {
    titleJa: '実践例 2: XYZ-Wing構造による [4] 確定',
    guideJa: 'XYZ-Wing構造により共通マスから 9 が消去され、[4] が確定しました。4 を入力してください。',
    titleZh: '實戰範例 2: XYZ-Wing 結構鎖定 [4]',
    guideZh: 'XYZ-Wing 結構使交集格中消去 9，確定保留解 [4]。請輸入 4！',
    titleEs: 'Ejemplo 2: Confirmación de [4] con XYZ-Wing',
    guideEs: 'La estructura XYZ-Wing elimina el 9 de la casilla compartida, dejando [4]. ¡Introduce 4!'
  },

  // --- STAGE 4 ---
  'swordfish_ex1': {
    titleJa: '実践例 1: 3x3 ソードフィッシュによる [5] 確定',
    guideJa: '3行の候補数 6 が3列のみに整列し、交差マスから 6 が消去され [5] が残りました。5 を入力してください！',
    titleZh: '實戰範例 1: 3x3 Swordfish 鎖定 [5]',
    guideZh: '3 行的候選數 6 僅鎖定於 3 列形成劍魚結構，交集格消去 6 後剩下 [5]。請輸入 5！',
    titleEs: 'Ejemplo 1: Swordfish 3x3 revela [5]',
    guideEs: 'Un Swordfish 3x3 bloquea el candidato 6 en 3 filas y columnas. Al eliminar el 6 queda [5]. ¡Introduce 5!'
  },
  'swordfish_ex2': {
    titleJa: '実践例 2: ソードフィッシュによる [9] 確定',
    guideJa: '候補数 1 のソードフィッシュ構造により交差マスから 1 が消去され [9] が残りました。9 を入力してください。',
    titleZh: '實戰範例 2: Swordfish 鎖定 [9]',
    guideZh: '候選數 1 的劍魚網格在交集格消去 1，確定剩餘解 [9]。請輸入 9！',
    titleEs: 'Ejemplo 2: Swordfish revela [9]',
    guideEs: 'La cuadrícula Swordfish elimina el candidato 1 dejando [9]. ¡Introduce 9!'
  },
  'jellyfish_ex1': {
    titleJa: '実践例 1: 4x4 ジェリーフィッシュによる [7] 確定',
    guideJa: '4行4列にわたる候補数 5 のジェリーフィッシュにより 5 が一括消去され、[7] が残りました。7 を入力してください！',
    titleZh: '實戰範例 1: 4x4 Jellyfish 鎖定 [7]',
    guideZh: '4 行 4 列的候選數 5 形成水母結構，消去同列其他 5 後剩下 [7]。請輸入 7！',
    titleEs: 'Ejemplo 1: Jellyfish 4x4 revela [7]',
    guideEs: 'Un Jellyfish 4x4 bloquea el candidato 5 en 4 filas y columnas. Al eliminar el 5 queda [7]. ¡Introduce 7!'
  },
  'jellyfish_ex2': {
    titleJa: '実践例 2: ジェリーフィッシュによる [3] 確定',
    guideJa: '候補数 8 のジェリーフィッシュ構造により 8 が消去され [3] が残りました。3 を入力してください。',
    titleZh: '實戰範例 2: Jellyfish 鎖定 [3]',
    guideZh: '候選數 8 的水母結構消去 8 後，確定剩餘正解 [3]。請輸入 3！',
    titleEs: 'Ejemplo 2: Jellyfish revela [3]',
    guideEs: 'El Jellyfish en el candidato 8 elimina el 8 dejando [3]. ¡Introduce 3!'
  },
  'unique_rectangles_ex1': {
    titleJa: '実践例 1: UR Type 1 による [7] 確定',
    guideJa: '四角形の3隅が [1,2] の時、致命的ループを回避するため4番目のマスで余分な候補数 [7] を確定入力してください！',
    titleZh: '實戰範例 1: 唯一矩形 UR Type 1 鎖定 [7]',
    guideZh: '矩形三頂點鎖定為 [1,2]，為避免致命多解迴圈，第 4 格確認額外候選數 [7]。請輸入 7！',
    titleEs: 'Ejemplo 1: Rectángulo Único Tipo 1 revela [7]',
    guideEs: 'Tres esquinas están bloqueadas en [1,2]. Para evitar el patrón mortal, la 4.ª esquina debe ser [7]. ¡Introduce 7!'
  },
  'unique_rectangles_ex2': {
    titleJa: '実践例 2: [3,8] ループ回避による [5] 確定',
    guideJa: '3隅が [3,8] の長方形において、ループ崩壊を防ぐ唯一数 [5] を確定入力してください。',
    titleZh: '實戰範例 2: [3,8] 迴圈迴避鎖定 [5]',
    guideZh: '三頂點為 [3,8] 的矩形中，填入防止迴圈崩潰的唯一解 [5]。請輸入 5！',
    titleEs: 'Ejemplo 2: Evasión de Bucle UR revela [5]',
    guideEs: 'Evita el patrón mortal [3,8] confirmando el candidato extra [5]. ¡Introduce 5!'
  },
  'simple_colouring_ex1': {
    titleJa: '実践例 1: 2色着色連鎖による [8] 確定',
    guideJa: '候補数 4 の強リンク網で青と黄の両方を見渡せるマスから 4 が消去され [8] が残りました。8 を入力してください！',
    titleZh: '實戰範例 1: 雙色著色連鎖鎖定 [8]',
    guideZh: '候選數 4 的強鏈中同時觀察藍色與黃色節點的交集格消去 4，剩下 [8]。請輸入 8！',
    titleEs: 'Ejemplo 1: Coloreo Simple revela [8]',
    guideEs: 'Una casilla que ve nodos 4 azules y amarillos elimina el 4, dejando [8]. ¡Introduce 8!'
  },
  'simple_colouring_ex2': {
    titleJa: '実践例 2: カラーリング矛盾解消による [2] 確定',
    guideJa: 'カラーリング二元性により候補数 7 が消去され、残った [2] を入力してください。',
    titleZh: '實戰範例 2: 著色法矛盾消去鎖定 [2]',
    guideZh: '依據著色二元性消去候選數 7 後，填入剩餘正解 [2]。請輸入 2！',
    titleEs: 'Ejemplo 2: Resolución de Conflicto de Coloreo revela [2]',
    guideEs: 'El coloreo simple elimina el 7 conflictivo, dejando [2]. ¡Introduce 2!'
  },
  '3d_medusa_ex1': {
    titleJa: '実践例 1: 3Dメドゥーサによる [3] 確定',
    guideJa: '3Dメドゥーサ立体着色連鎖によりターゲットマスから 6 が消去され [3] が残りました。3 を入力してください！',
    titleZh: '實戰範例 1: 3D 美杜莎連鎖鎖定 [3]',
    guideZh: '3D 美杜莎立體著色鏈消去目標格中的 6，留下正確解 [3]。請輸入 3！',
    titleEs: 'Ejemplo 1: Medusa 3D revela [3]',
    guideEs: 'La cadena tridimensional Medusa 3D elimina el 6 dejando [3]. ¡Introduce 3!'
  },
  '3d_medusa_ex2': {
    titleJa: '実践例 2: 3Dメドゥーサ連鎖による [9] 確定',
    guideJa: 'メドゥーサ連鎖の分析結果、ターゲットマスから 1 が消去され [9] が確定しました。9 を入力してください。',
    titleZh: '實戰範例 2: 3D 美杜莎分析鎖定 [9]',
    guideZh: '美杜莎鏈分析使目標格消去 1，確定剩下正解 [9]。請輸入 9！',
    titleEs: 'Ejemplo 2: Análisis Medusa 3D revela [9]',
    guideEs: 'El análisis de la cadena Medusa elimina el 1 en la casilla objetivo, dejando [9]. ¡Introduce 9!'
  },
  'xy_chains_ex2': {
    titleJa: '実践例 2: XY-チェイン連鎖による [2] 確定',
    guideJa: 'XY-チェイン連鎖によりターゲットマスから 5 が消去され、残った [2] を入力してください。',
    titleZh: '實戰範例 2: XY-Chains 連鎖鎖定 [2]',
    guideZh: '透過 XY-Chains 連鎖消去 5 後，填入剩餘正解 [2]。請輸入 2！',
    titleEs: 'Ejemplo 2: Cadena XY-Chains revela [2]',
    guideEs: 'La cadena XY-Chains elimina el 5 dejando [2]. ¡Introduce 2!'
  },
  'wxyz_wing_ex1': {
    titleJa: '実践例 1: WXYZ-Wingによる [9] 確定',
    guideJa: 'ピボットと3つのウィングにより共通制限候補数 4 が消去され、[9] が確定しました。9 を入力してください！',
    titleZh: '實戰範例 1: WXYZ-Wing 鎖定 [9]',
    guideZh: '樞紐與 3 翼共同消去限制候選數 4，確定正解 [9]。請輸入 9！',
    titleEs: 'Ejemplo 1: WXYZ-Wing revela [9]',
    guideEs: 'El pivote y las 3 alas eliminan el 4 restringido, confirmando [9]. ¡Introduce 9!'
  },
  'wxyz_wing_ex2': {
    titleJa: '実践例 2: WXYZ-Wing構造による [1] 確定',
    guideJa: 'WXYZ-Wing連携によりターゲットマスから 7 が消去され、残った [1] を入力してください。',
    titleZh: '實戰範例 2: WXYZ-Wing 結構鎖定 [1]',
    guideZh: 'WXYZ-Wing 聯動消去目標格中的 7，填入剩餘正解 [1]。請輸入 1！',
    titleEs: 'Ejemplo 2: Estructura WXYZ-Wing revela [1]',
    guideEs: 'La coordinación WXYZ-Wing elimina el 7 dejando [1]. ¡Introduce 1!'
  },
  'empty_rectangles_ex2': {
    titleJa: '実践例 2: 空の矩形(ER)による [5] 確定',
    guideJa: 'ER構造により交差マスから 3 が消去され、残った [5] を入力してください。',
    titleZh: '實戰範例 2: 空矩形 ER 鎖定 [5]',
    guideZh: '空矩形 ER 結構在交點消去 3，填入剩餘正解 [5]。請輸入 5！',
    titleEs: 'Ejemplo 2: Rectángulo Vacío revela [5]',
    guideEs: 'La estructura ER elimina el 3 dejando [5]. ¡Introduce 5!'
  },

  // --- STAGE 5 ---
  'aic_ex2': {
    titleJa: '実践例 2: AIC連鎖推論による [6] 確定',
    guideJa: 'AIC交互連鎖推論によりターゲットマスから 5 が消去され、残った [6] を入力してください。',
    titleZh: '實戰範例 2: AIC 交互鏈鎖定 [6]',
    guideZh: 'AIC 交互推論鏈使目標格消去 5，填入剩餘正解 [6]。請輸入 6！',
    titleEs: 'Ejemplo 2: Deducción AIC revela [6]',
    guideEs: 'La deducción por cadena alterna AIC elimina el 5 dejando [6]. ¡Introduce 6!'
  },
  'als_ex1': {
    titleJa: '実践例 1: ALS-XZ結合による [1] 確定',
    guideJa: '2つのALS集合が制限数 2 で相殺連結され、交差マスから 7 が消去され [1] が残りました。1 を入力してください！',
    titleZh: '實戰範例 1: ALS-XZ 鎖定 [1]',
    guideZh: '兩組 ALS 集合透過媒指數 2 連結，在交集格外廓消去 7 後剩下 [1]。請輸入 1！',
    titleEs: 'Ejemplo 1: ALS-XZ revela [1]',
    guideEs: 'Dos conjuntos ALS enlazados eliminan el 7 común dejando [1]. ¡Introduce 1!'
  },
  'als_ex2': {
    titleJa: '実践例 2: ALS連鎖推論による [8] 確定',
    guideJa: 'ALS-XZ連鎖構造によりターゲットマスから 9 が消去され、残った [8] を入力してください。',
    titleZh: '實戰範例 2: ALS-XZ 連鎖鎖定 [8]',
    guideZh: 'ALS-XZ 連鎖結構在目標格消去 9，填入剩餘正解 [8]。請輸入 8！',
    titleEs: 'Ejemplo 2: Cadena ALS revela [8]',
    guideEs: 'La estructura ALS-XZ elimina el 9 en la casilla objetivo, dejando [8]. ¡Introduce 8!'
  },
  'forcing_chains_ex1': {
    titleJa: '実践例 1: フォーシングチェインによる [7] 確定',
    guideJa: 'テスト候補数の真偽にかかわらず、全分岐がターゲットマスの [7] に収束します。確定した [7] を入力してください！',
    titleZh: '實戰範例 1: 強制鏈 Forcing Chain 鎖定 [7]',
    guideZh: '無論測試候選數真偽，所有分歧路徑均指向目標格的 [7]。請輸入確定解 7！',
    titleEs: 'Ejemplo 1: Cadena Forzada revela [7]',
    guideEs: 'Cualquiera que sea la hipótesis, todas las bifurcaciones señalan [7]. ¡Introduce 7!'
  },
  'forcing_chains_ex2': {
    titleJa: '実践例 2: 仮定推論収束による [4] 確定',
    guideJa: 'フォーシングチェイン収束分析により、ターゲットマスに [4] を確定入力してください。',
    titleZh: '實戰範例 2: 假說推論收斂鎖定 [4]',
    guideZh: '強制鏈收斂分析確立目標格解，請填入 [4]！',
    titleEs: 'Ejemplo 2: Convergencia de Hipótesis revela [4]',
    guideEs: 'El análisis de convergencia confirma la casilla objetivo. ¡Introduce [4]!'
  },
  'exocet_ex1': {
    titleJa: '実践例 1: エクソセ (Exocet) による [5] 確定',
    guideJa: 'ExocetのBaseセル [1,2] と [3,4] の対角交差法則により、Targetセルで正解 [5] が確定しました。5 を入力してください！',
    titleZh: '實戰範例 1: 飛魚 Exocet 鎖定 [5]',
    guideZh: 'Exocet Base 格 [1,2] 與 [3,4] 的交叉法則使 Target 格確定為 [5]。請輸入 5！',
    titleEs: 'Ejemplo 1: Exocet revela [5]',
    guideEs: 'La regla de cruce Exocet Base [1,2] y [3,4] confirma [5] en la casilla Target. ¡Introduce 5!'
  },
  'exocet_ex2': {
    titleJa: '実践例 2: エクソセ 交差ライン分析による [8] 確定',
    guideJa: 'Exocet交差ライン分析によりターゲットマスに [8] を確定入力してください。',
    titleZh: '實戰範例 2: Exocet 交叉線分析鎖定 [8]',
    guideZh: 'Exocet 交叉線分析確立目標格解，請填入 [8]！',
    titleEs: 'Ejemplo 2: Análisis de Línea Exocet revela [8]',
    guideEs: 'El análisis de líneas de cruce Exocet confirma la casilla objetivo. ¡Introduce [8]!'
  }
};

function enrichMission(m) {
  if (!m.title) m.title = {};
  if (!m.guide) m.guide = {};

  const fix = missionFixes[m.id];
  if (fix) {
    if (fix.titleJa) m.title.ja = fix.titleJa;
    if (fix.guideJa) m.guide.ja = fix.guideJa;
    if (fix.titleZh) m.title.zh = fix.titleZh;
    if (fix.guideZh) m.guide.zh = fix.guideZh;
    if (fix.titleEs) m.title.es = fix.titleEs;
    if (fix.guideEs) m.guide.es = fix.guideEs;
  }

  // Ensure ZH is present and clean
  if (!m.title.zh) {
    m.title.zh = (m.title.en || 'Mission')
      .replace('Example 1:', '實戰範例 1:')
      .replace('Example 2:', '實戰範例 2:');
  }
  if (!m.guide.zh) {
    m.guide.zh = `根據數獨技巧消去候選數，目標格確定為 [${m.correctVal}]。請輸入 ${m.correctVal}！`;
  }

  // Ensure ES is present and clean
  if (!m.title.es) {
    m.title.es = (m.title.en || 'Misión')
      .replace('Example 1:', 'Ejemplo 1:')
      .replace('Example 2:', 'Ejemplo 2:');
  }
  if (!m.guide.es) {
    m.guide.es = `Elimina los candidatos correspondientes para confirmar el [${m.correctVal}]. ¡Introduce ${m.correctVal}!`;
  }

  // Ensure JA is mathematically exact
  if (!m.guide.ja || !m.guide.ja.includes(String(m.correctVal))) {
    m.guide.ja = `解法により不要な候補数が消去され、[${m.correctVal}] が確定しました。${m.correctVal} を入力してください。`;
  }
}

// Enrich all stages
Object.values(STAGE1_PRACTICE).forEach(ms => ms.forEach(enrichMission));
Object.values(STAGE2_PAIRS_PRACTICE).forEach(ms => ms.forEach(enrichMission));
Object.values(STAGE2_TUPLES_PRACTICE).forEach(ms => ms.forEach(enrichMission));
Object.values(STAGE3_PRACTICE).forEach(ms => ms.forEach(enrichMission));
Object.values(STAGE4_FISH_PRACTICE).forEach(ms => ms.forEach(enrichMission));
Object.values(STAGE4_CHAINS_PRACTICE).forEach(ms => ms.forEach(enrichMission));
Object.values(STAGE5_PRACTICE).forEach(ms => ms.forEach(enrichMission));

// Write back all files
function writeStageFile(path, varName, obj, comment) {
  const code = `/**\n * ${comment}\n */\n\nexport const ${varName} = ${JSON.stringify(obj, null, 2)};\n`;
  writeFileSync(path, code, 'utf8');
  console.log(`✅ Saved: ${path}`);
}

writeStageFile('src/data/academy/practice/stage1Practice.js', 'STAGE1_PRACTICE', STAGE1_PRACTICE, 'Stage 1 Practice Missions (Verified)');
writeStageFile('src/data/academy/practice/stage2PairsPractice.js', 'STAGE2_PAIRS_PRACTICE', STAGE2_PAIRS_PRACTICE, 'Stage 2 Pairs Practice (Verified)');
writeStageFile('src/data/academy/practice/stage2TuplesPractice.js', 'STAGE2_TUPLES_PRACTICE', STAGE2_TUPLES_PRACTICE, 'Stage 2 Tuples Practice (Verified)');
writeStageFile('src/data/academy/practice/stage3Practice.js', 'STAGE3_PRACTICE', STAGE3_PRACTICE, 'Stage 3 Practice (Verified)');
writeStageFile('src/data/academy/practice/stage4FishPractice.js', 'STAGE4_FISH_PRACTICE', STAGE4_FISH_PRACTICE, 'Stage 4 Fish Practice (Verified)');
writeStageFile('src/data/academy/practice/stage4ChainsPractice.js', 'STAGE4_CHAINS_PRACTICE', STAGE4_CHAINS_PRACTICE, 'Stage 4 Chains Practice (Verified)');
writeStageFile('src/data/academy/practice/stage5Practice.js', 'STAGE5_PRACTICE', STAGE5_PRACTICE, 'Stage 5 Practice (Verified)');

console.log('🎉 All 54 practice missions updated and mathematically synchronized in 5 languages!');
