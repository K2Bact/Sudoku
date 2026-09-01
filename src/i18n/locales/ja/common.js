export const common = {
  common: {
    you: "あなた",
    back: '戻る',
    close: '閉じる',
    confirm: '決定',
    cancel: 'キャンセル',
    restart: 'やり直す',
    newGame: '新しいゲーム',
    home: 'メインホーム',
    save: '保存',
    pause: '一時停止',
    resume: '再開する',
    loading: '読み込み中...',
    error: 'エラー',
    exitAppPrompt: '戻るボタンをもう一度押すとアプリを終了します。',
    confirmLeaveGame: 'ゲームを中断してホームに戻りますか？'
  },
  calendar: {
    days: {
      sun: '日',
      mon: '月',
      tue: '火',
      wed: '水',
      thu: '木',
      fri: '金',
      sat: '土'
    }
  },
  levels: {
    1: '入門',
    2: '初級',
    3: '中級',
    4: '上級',
    5: '達人'
  },
  header: {
    levelPrefix: 'Lv.{level}',
    mistakes: 'ミス {count}/{max}',
    mistakesUnlimited: 'ミス {count}回',
    timeAttackMistake: 'ミス {count}回 (+10秒)',
    combo: '🔥 {count} 連続!',
    restartShort: 'やり直し',
    newGameShort: '新規対局',
    pauseTooltip: 'タイマー一時停止',
    themeTooltip: 'テーマ変更',
    soundOn: '効果音OFF',
    soundOff: '効果音ON'
  },
  keypad: {
    undo: '元に戻す',
    erase: '消去',
    notes: 'メモ',
    hint: 'ヒント',
    fastEntry: '連続入力',
    fastEntryLocked: '{number}番固定'
  },
  board: {
    pausedTitle: 'ゲームが一時停止されました',
    tapToResume: 'タップして再開 ▶️',
    resumeTooltip: 'タッチして再開'
  },
  themes: {
    toast: '🎨 {name}に変更しました',
    clay: '🏺 ウォームセラミック＆クレイ',
    clayDesc: '温かみのあるマットな陶器キーキャップ＆3D立体感',
    matteDark: '🌌 ソフトマットレジンダーク',
    matteDarkDesc: '目に優しいミッドナイトトーン＆高級マットレジン質感',
    pureCeramic: '🧊 ピュアクレイモフィズム',
    pureCeramicDesc: '透明感のある滑らかな3Dホワイト陶器キーキャップ',
    editorial: '📰 クラシックピュアペーパー',
    editorialDesc: '端正で目に優しいスイス・エディトリアル感性のペーパートーン'
  },
  numbers: {
    timeSeconds: '{seconds}秒',
    timeMinutes: '{minutes}分',
    timeHours: '{hours}時間',
    percent: '{value}%'
  },
  share: {
    title: 'Sudoku Master',
    text: '🧩 Sudoku {mode} Lv.{level} {name}を[{time}]でクリア！ ランク: {rank} (ミス: {mistakes}回)。あなたの脳力に挑戦してみよう！',
    copied: '結果がクリップボードにコピーされました！'
  },
  conflicts: {
    boxes: [
      '左上', '中央上', '右上',
      '左中', '中央', '右中',
      '左下', '中央下', '右下'
    ],
    boxDuplicate: '⚠️ [{box} 3x3ブロック]にすでに{num}があります！ {suffix}',
    rowDuplicate: '⚠️ {row}行目にすでに{num}があります！ {suffix}',
    colDuplicate: '⚠️ {col}列目にすでに{num}があります！ {suffix}',
    multipleDuplicates: '⚠️ 同じ3x3ブロック・行・列にすでに{num}があります！ {suffix}',
    notSolution: '⚠️ {num}はこのマスの正解ではありません！ {suffix}',
    boardFullHasMistakes: '⚠️ ボードが埋まりましたが、間違いがあります。もう一度確認してください！',
    timeAttackSuffix: '(不正解 {count}回 | +10秒ペナルティ)',
    classicSuffix: '(ミス {count}/3)'
  },
  tiers: {
    grandMaster: {
      title: '👑 グランドマスター',
      desc: '全プレイヤーの上位{percentile}%！ ごく少数だけが到達する1%マスター級の論理力です。'
    },
    mensa: {
      title: '🧠 メンサ級上位知能',
      desc: '全プレイヤーの上位{percentile}%！ メンサレベルの優れた論理的分析力を発揮しています。'
    },
    superior: {
      title: '⚡ 優秀な頭脳',
      desc: '全プレイヤーの上位{percentile}%！ 鋭い直感と優れた問題解決能力を持っています。'
    },
    aboveAverage: {
      title: '💡 平均以上の論理力',
      desc: '全プレイヤーの上位{percentile}%！ 安定した柔軟な思考でパズルを解いています。'
    },
    balanced: {
      title: '🎯 バランスの良い頭脳',
      desc: '全プレイヤーの上位{percentile}%！ 5つの認知能力が均等に発達した理想的な状態です。'
    },
    developing: {
      title: '🌱 成長中の頭脳',
      desc: '脳トレを始めたばかりの段階です。続けるほど指数が急上昇します！'
    }
  }
};
