export const achievements = {
  achievements: {
    categories: {
      all: '전체',
      progression: '완주·성장',
      logic: '논리·무결점',
      speed: '스피드·랭크',
      difficulty: '난이도·생존',
      special: '데일리·배틀'
    },
    unlockedToast: '업적 달성!',
    tabTitle: '업적',
    statsTab: '통계',
    unlockedCount: '{unlocked} / {total} 달성 ({pct}%)',
    lockedBadge: '미달성',
    unlockedAt: '달성일: {date}',

    // 1 ~ 7. 완주 & 진행
    first_win: { title: '첫 발자국', desc: '난이도 상관없이 생애 첫 스도쿠 퍼즐 완주' },
    win_5: { title: '브론즈 퍼즐러', desc: '누적 5판 완주 달성' },
    win_10: { title: '스도쿠 애호가', desc: '누적 10판 완주 달성' },
    win_25: { title: '실버 퍼즐러', desc: '누적 25판 완주 달성' },
    win_50: { title: '골드 베테랑', desc: '누적 50판 완주 달성' },
    win_100: { title: '센추리 클럽', desc: '누적 100판 완주 달성' },
    win_250: { title: '스도쿠의 전설', desc: '누적 250판 완주 달성' },

    // 8 ~ 14. 논리 & 무결점
    flawless_1: { title: '무결점 마스터', desc: '단 1번의 실수도 없이(오답 0회) 퍼즐 완주' },
    flawless_5: { title: '완벽주의자', desc: '오답 0회 무결점 퍼즐 5회 달성' },
    pure_logic_expert: { title: '순수 논리의 경지', desc: '힌트를 단 1번도 쓰지 않고 Lv.4 어려움 클리어' },
    pure_logic_master: { title: '궁극의 마인드', desc: '힌트와 실수 없이 Lv.5 마스터 난이도 클리어' },
    note_master: { title: '메모의 달인', desc: '메모 기능을 50회 이상 적극 활용' },
    no_notes: { title: '직관의 눈', desc: '메모를 전혀 쓰지 않고 Lv.3 보통 이상 클리어' },
    fast_entry_fan: { title: '신속의 번개', desc: '빠른 숫자 고정 입력 모드로 1판 완주' },

    // 15 ~ 19. 스피드 & 콤보
    rank_s_plus: { title: '신속의 경지', desc: '최단 시간 👑 S+ 랭크 최초 달성' },
    speed_runner_3m: { title: '3분 컷', desc: '3분(180초) 이내에 퍼즐 완주' },
    speed_runner_2m: { title: '번개손 스피드런', desc: '2분(120초) 이내에 퍼즐 초고속 완주' },
    combo_streak_5: { title: '콤보 아티스트', desc: '스피드런 모드에서 5연속 콤보 달성' },
    combo_streak_10: { title: '콤보 마에스트로', desc: '스피드런 모드에서 10연속 콤보 달성' },

    // 20 ~ 26. 난이도 정복 & 서바이벌
    clear_lv1: { title: '입문 정복자', desc: 'Lv.1 입문 난이도 완주' },
    clear_lv2: { title: '쉬움 마스터', desc: 'Lv.2 쉬움 난이도 완주' },
    clear_lv3: { title: '중급자 등극', desc: 'Lv.3 보통 난이도 완주' },
    clear_lv4: { title: '상급 정복자', desc: 'Lv.4 어려움 난이도 완주' },
    clear_lv5: { title: '그랜드 마스터', desc: 'Lv.5 마스터 최고 난이도 완주' },
    survival_hero: { title: '타임 서바이벌', desc: '서바이벌 모드 완주 성공' },
    survival_clutch: { title: '기사회생', desc: '남은 시간 5초 이하 위기를 극복하고 클리어' },

    // 27 ~ 30. 데일리, 배틀 & 두뇌지능
    daily_first: { title: '일일 탐험가', desc: '오늘의 데일리 챌린지 첫 완주' },
    daily_streak_7: { title: '7일간의 기적', desc: '7일 연속 출석' },
    battle_first_win: { title: '검투사의 첫 승', desc: '1v1 온라인 배틀 또는 AI 배틀 첫 승리' },
    iq_150: { title: '논리의 달인', desc: 'Logic Score 150점 이상 달성' }
  }
};
