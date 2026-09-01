import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const localesDir = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/Suidoku/src/i18n/locales';
const outputFile = 'D:/PowerNeJa/PythonWorkspace/Project_Dev/HINDI_TRANSLATIONS_AUDIT.txt';

async function loadDict(langCode) {
  const dir = path.join(localesDir, langCode);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  const res = {};

  for (const f of files) {
    const ns = path.basename(f, '.js');
    const full = path.join(dir, f);
    const mod = await import(pathToFileURL(full).href);
    const exported = mod[ns] || mod.default || mod;
    res[ns] = (exported && typeof exported === 'object' && exported[ns]) ? exported[ns] : exported;
  }
  return res;
}

function flattenDict(obj, prefix = '') {
  const res = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(res, flattenDict(v, key));
    } else {
      res[key] = v;
    }
  }
  return res;
}

function getUiMetadata(key) {
  // 1. Tab buttons & Segmented controls (Strictly short)
  if (key.includes('tabTitle') || key.includes('statsTab') || key.includes('leaderboardTab') || key.includes('.tabs.')) {
    return { type: '📱 상단 3분할 탭 버튼', max: 10, constraint: '1줄 고정 (최대 10자 이내 필수, 짧을수록 좋음)' };
  }
  // 2. Buttons & Actions
  if (key.endsWith('Btn') || key.endsWith('Button') || key.includes('.buttons.') || key.endsWith('.cancel') || key.endsWith('.confirm') || key.endsWith('.action')) {
    return { type: '🔘 액션 버튼 레이블', max: 16, constraint: '1줄 고정 (최대 16자 이내)' };
  }
  // 3. Small Badges, Status Pills, Mini Tags
  if (key.includes('badge') || key.includes('Pill') || key.includes('disqualified') || key.includes('tier') || key.includes('Tag') || key.includes('mistakesCount')) {
    return { type: '🏷️ 소형 상태 뱃지 / 필', max: 14, constraint: '1줄 고정 (최대 14자 이내)' };
  }
  // 4. Radar Chart 5-Axis Labels
  if (key.includes('brainReport.durability') || key.includes('brainReport.logic') || key.includes('brainReport.speed') || key.includes('brainReport.focus') || key.includes('brainReport.accuracy')) {
    return { type: '📊 5각형 레이더 차트 축 라벨', max: 16, constraint: '1줄 고정 (최대 16자 이내, 차트 밖 침범 방지)' };
  }
  // 5. Category Chips / Filter Tags
  if (key.includes('categories.') || key.includes('.filter.')) {
    return { type: '🔖 카테고리 필터 칩', max: 12, constraint: '1줄 고정 (최대 12자 이내)' };
  }
  // 6. Home Mode Titles
  if (key.includes('modes.') && key.endsWith('.title')) {
    return { type: '🗂️ 메인 홈 모드 카드 제목', max: 20, constraint: '1줄 고정 (최대 20자 이내 권장, 괄호 부가설명 지양)' };
  }
  // 7. Rival Mode sub-badges
  if (key.includes('rivalModes.')) {
    return { type: '⚡ 라이벌 모드 뱃지', max: 16, constraint: '1줄 고정 (최대 16자 이내)' };
  }
  // 8. Achievement & Strategy Titles
  if (key.includes('achievements.') && key.endsWith('.title')) {
    return { type: '🏆 업적 타이틀', max: 24, constraint: '1줄 고정 (최대 24자 이내)' };
  }
  // 9. Daily Badge & Calendar Progress Subtext
  if (key.includes('daily.badgeDesc')) {
    return { type: '📅 캘린더 배지 달성 진행 서브텍스트', max: 32, constraint: '1줄 고정 (최대 32자 이내, 괄호 설명 간결화 필수)' };
  }
  if (key.includes('daily.badgeTitle')) {
    return { type: '📅 캘린더 배지 카드 제목', max: 24, constraint: '1줄 고정 (최대 24자 이내)' };
  }
  // 10. Screen & Modal Header Titles
  if (key.endsWith('Title') || key.endsWith('Header') || key.endsWith('header')) {
    return { type: '📌 화면 / 모달 상단 헤더 타이틀', max: 26, constraint: '1줄 고정 (최대 26자 이내)' };
  }
  // 11. External Share text
  if (key.includes('shareText')) {
    return { type: '🌐 SNS / 클립보드 외부 공유 텍스트', max: 0, constraint: 'UI 영역 아님 (줄바꿈 포함 자유 서술)' };
  }
  // 12. Settings / Privacy policy / Subtitles (Multi-line)
  if (key.includes('privacy.') || key.includes('rules.') || key.includes('.desc') || key.includes('Notice') || key.includes('Desc')) {
    return { type: '📄 카드 / 모달 본문 설명문', max: 0, constraint: '멀티라인 지원 (자연스러운 2~4줄 줄바꿈 수용)' };
  }
  // Default general UI text
  return { type: '💬 일반 UI 텍스트', max: 30, constraint: '간결한 모바일 친화적 표현 권장' };
}

const koDict = flattenDict(await loadDict('ko'));
const enDict = flattenDict(await loadDict('en'));
const hiDict = flattenDict(await loadDict('hi'));

let out = '';
out += '================================================================================\n';
out += '🇮🇳 [HINDI_TRANSLATIONS_AUDIT.txt] 힌디어(Hindi) 전수 번역 정밀 감수용 데이터\n';
out += '================================================================================\n';
out += '★ 기준선: [ENGLISH BASELINE] 영어 원문\n';
out += '★ 감수 대상: [HINDI TRANSLATION] 힌디어 번역문\n';
out += '★ 보조 참고: [KOREAN REFERENCE] 한국어 원문\n';
out += '★ UI 제약: [UI CONTEXT & MAX LENGTH] 모바일 화면 배치 제약 조건\n';
out += '================================================================================\n';
out += '💡 감수자 가이드라인:\n';
out += '1. [1줄 고정] 태그가 붙은 항목은 지정된 글자수 이내로 간결하고 자연스럽게 번역해 주세요.\n';
out += '2. 1줄 고정 영역에는 불필요한 괄호 부가설명이나 긴 영어 음차를 덧붙이지 마세요.\n';
out += '3. 힌디어 특유의 성수 일치(लिंग/वचन) 및 동적 변수({count}, {level}) 문맥을 자연스럽게 검토해 주세요.\n';
out += '4. 브랜드명 오타 "Suidoku"가 있다면 "Sudoku"(सुडोकू)로 교정되어야 합니다.\n';
out += '5. 모바일 게임에 적합한 현대적이고 대중적인 표준 힌디어(힌글리시/산스크리트어 과다 지양)를 권장합니다.\n';
out += '================================================================================\n\n';

const allKeys = Object.keys(koDict);
let currentNamespace = '';

for (const key of allKeys) {
  const ns = key.split('.')[0];
  if (ns !== currentNamespace) {
    currentNamespace = ns;
    out += `\n################################################################################\n`;
    out += `### [NAMESPACE: ${ns.toUpperCase()}]\n`;
    out += `################################################################################\n\n`;
  }

  const meta = getUiMetadata(key);

  out += `--------------------------------------------------------------------------------\n`;
  out += `[KEY]: ${key}\n`;
  out += `[UI CONTEXT]:        ${meta.type} [${meta.constraint}]\n`;
  out += `[ENGLISH BASELINE]:  ${enDict[key] || ''}\n`;
  out += `[KOREAN REFERENCE]:  ${koDict[key] || ''}\n`;
  out += `[HINDI TRANSLATION]: ${hiDict[key] || ''}\n\n`;
}

fs.writeFileSync(outputFile, out, 'utf8');
console.log(`✅ Successfully generated ${outputFile} with UI Context & Max Length metadata (${allKeys.length} keys)!`);
