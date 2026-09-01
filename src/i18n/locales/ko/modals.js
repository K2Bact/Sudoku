export const modals = {
  modals: {
    victory: {
      title: '퍼즐 완성!',
      desc: '축하합니다!\n스도쿠 퍼즐을 성공적으로 해결하셨습니다.',
      rankLabel: '클리어 등급: {title}',
      difficultyLabel: '난이도',
      timeLabel: '소요 시간',
      timeRemainingLabel: '남은 시간',
      mistakesLabel: '실수 횟수',
      mistakesCount: '오답 {count}회',
      nextGame: '다음 퍼즐 도전',
      leaderboardBtn: '🏆 전체 랭킹 보기',
      shareBtn: '기록 공유',
      copiedToast: '🎉 클리어 기록이 클립보드에 복사되었습니다!',
      shareText: '🧩 Sudoku {mode} Lv.{level} {name}를 [{time}]만에 클리어! 등급: {rank} (실수 {mistakes}회). 당신의 두뇌에 도전해보세요!',
      ranks: {
        'S+': '👑 S+ (신속의 경지)',
        'S': '⭐️ S (마스터)',
        'A': '🥇 A (숙련자)',
        'B': '🥈 B (노련함)',
        'C': '🥉 C (완주 성공)'
      }
    },
    gameOver: {
      title: '게임 오버',
      desc: '실수 제한 3회를 모두 소진하셨습니다.\n광고를 시청하고 부활할 수 있습니다.',
      descNoRevive: '실수 제한 3회를 모두 소진하셨습니다.\n(부활 기회를 이미 사용하셨습니다)',
      reviveBtn: '광고 보고 부활하기 (+1 기회)',
      restartBtn: '처음부터 다시하기'
    },
    newGame: {
      title: '난이도 선택',
      desc: '도전할 스도쿠 난이도를\n선택해 주세요.'
    },
    storeReview: {
      title: 'Sudoku 플레이는 즐거우신가요?',
      desc: '소중한 평점과 솔직한 리뷰를 남겨주시면\n더 재미있고 완성도 높은 게임을 만드는 데 큰 힘이 됩니다! 💙',
      submitBtn: '스토어에 리뷰 남기기',
      laterBtn: '다음에 하기',
      thankYou: '💙 소중한 의견 감사합니다! 스토어 페이지로 이동합니다.'
    },
    dailyReward: {
      title: '일일 출석 보상 도착!',
      desc: '연속 {days}일차 출석 완료!\n무료 힌트 +1개가 충전되었습니다.',
      confirm: '보상 받기'
    },
    hintReward: {
      title: '무료 힌트 충전',
      desc: '짧은 광고를 시청하시면\n무료 힌트 1개가 즉시 충전됩니다.',
      watchAd: '광고 보고 힌트 받기 (+1개)',
      chancesLeft: '이번 게임 남은 충전: {remaining}/{max}회',
      maxReached: '게임당 광고 힌트 충전은 최대 2회까지만 가능합니다.',
      later: '다음에'
    }
  }
};
