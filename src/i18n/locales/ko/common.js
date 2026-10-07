export const common = {
  common: {
    you: "나",
    back: '뒤로가기',
    close: '닫기',
    on: '켬',
    off: '끔',
    confirm: '확인',
    cancel: '취소',
    restart: '다시시작',
    restartConfirm: "이 퍼즐을 다시 시작할까요? 지금 게임은 진 판으로 기록돼요.",
    abandonConfirm: "진행 중인 게임이 있어요. 새로 시작하면 지금 게임은 진 판으로 기록돼요. 시작할까요?",
    newGame: '새 게임',
    home: '메인 홈',
    pause: '일시정지',
    resume: '이어하기',
    exitAppPrompt: '뒤로가기 버튼을 한 번 더 누르면 앱이 종료됩니다.',
    confirmLeaveGame: '게임을 중단하고 홈으로 이동하시겠습니까?',
    shareUnavailable: '공유할 수 없습니다. 이 기기에서는 지원되지 않습니다.'
  },
  calendar: {
    days: {
      sun: '일',
      mon: '월',
      tue: '화',
      wed: '수',
      thu: '목',
      fri: '금',
      sat: '토'
    }
  },
  levels: {
    1: '입문',
    2: '쉬움',
    3: '보통',
    4: '어려움',
    5: '전문가'
  },
  header: {
    levelPrefix: 'Lv.{level}',
    mistakes: '실수 {count}/{max}',
    mistakesUnlimited: '실수 {count}회',
    timeAttackMistake: '실수 {count}회 (+10s)',
    combo: '🔥 {count} COMBO!',
    restartShort: '다시시작',
    newGameShort: '새 게임',
    themeTooltip: '디자인 테마 변경',
    soundOn: '사운드 끄기',
    soundOff: '사운드 켜기'
  },
  keypad: {
    undo: '취소',
    erase: '지우개',
    notes: '메모',
    notesOn: '메모 ON',
    notesOff: '메모 OFF',
    hint: '힌트',
    rewardHint: '+1 힌트',
    fastEntry: '빠른입력'
  },
  board: {
    pausedTitle: '게임이 일시정지 되었습니다',
    tapToResume: '화면을 탭하여 계속하기 ▶️',
    resumeTooltip: '터치하여 계속하기'
  },
  themes: {
    clay: '🏺 웜 세라믹 & 클레이',
    matteDark: '🌌 소프트 매트 레진 다크',
    pureCeramic: '🧊 퓨어 클레이모피즘',
    editorial: '📰 클래식 퓨어 페이퍼'
  },
  conflicts: {
    boxDuplicate: '⚠️ [{box} 3x3 박스]에 이미 숫자 {num}이(가) 있습니다! {suffix}',
    rowDuplicate: '⚠️ {row}번째 가로줄에 이미 숫자 {num}이(가) 있습니다! {suffix}',
    colDuplicate: '⚠️ {col}번째 세로줄에 이미 숫자 {num}이(가) 있습니다! {suffix}',
    multipleDuplicates: '⚠️ 같은 3x3 박스 및 가로/세로줄에 이미 숫자 {num}이(가) 있습니다! {suffix}',
    notSolution: '⚠️ 숫자 {num}은(는) 이 칸의 정답이 아닙니다! {suffix}',
    cageDuplicate: '⚠️ 이 묶음에 이미 숫자 {num}이(가) 있습니다! {suffix}',
    cageSum: '⚠️ 이 묶음의 합이 맞지 않습니다 (합: {sum})! {suffix}',
    boardFullHasMistakes: '⚠️ 보드가 모두 채워졌으나 오답 칸이 있습니다. 다시 확인해 보세요!',
    timeAttackSuffix: '(오답 {count}회 | +10초 패널티)',
    classicSuffix: '(실수 {count}/3)',
    // Classic with the three-mistake limit switched off: no limit to count to, no time penalty.
    freeSuffix: '(실수 {count})'
  },
  tiers: {
    grandMaster: {
      title: '👑 그랜드 마스터',
      desc: '최고 등급에 도달했습니다.'
    },
    expert: {
      title: '🧠 달인',
      desc: '어려운 퍼즐을 꾸준히 풀고 있습니다.'
    },
    superior: {
      title: '⚡ 상급',
      desc: '상급 퍼즐에도 도전할 실력입니다.'
    },
    aboveAverage: {
      title: '💡 중급',
      desc: '꾸준히 실력이 늘고 있습니다.'
    },
    balanced: {
      title: '🎯 균형형',
      desc: '5가지 플레이 지표가 고르게 오르고 있습니다.'
    },
    developing: {
      title: '🌱 초보',
      desc: '플레이할수록 점수가 오릅니다.'
    }
  }
};
