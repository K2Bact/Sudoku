export const common = {
  common: {
    you: "あなた",
    back: '戻る',
    close: '閉じる',
    on: 'オン',
    off: 'オフ',
    confirm: '決定',
    cancel: 'キャンセル',
    restart: 'やり直す',
    restartConfirm: "このパズルをやり直しますか？今のゲームは負けとして記録されます。",
    abandonConfirm: "進行中のゲームがあります。新しく始めると、今のゲームは負けとして記録されます。始めますか？",
    newGame: '新しいゲーム',
    home: 'ホーム',
    pause: '一時停止',
    resume: '再開する',
    exitAppPrompt: '戻るボタンをもう一度押すとアプリを終了します。',
    confirmLeaveGame: 'ゲームを中断してホームに戻りますか？',
    shareUnavailable: 'この端末では共有できません。'
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
    floatCombo: '-{seconds}秒 ({count} 連続!)',
    floatPenalty: '+{seconds}秒',
    floatBonus: '+{seconds}秒ボーナス!',
    restartShort: 'やり直し',
    newGameShort: '新しいゲーム',
    themeTooltip: 'テーマ変更',
    soundOn: '効果音OFF',
    soundOff: '効果音ON'
  },
  keypad: {
    undo: '元に戻す',
    erase: '消去',
    notes: 'メモ',
    notesOn: 'メモ ON',
    notesOff: 'メモ OFF',
    hint: 'ヒント',
    rewardHint: '+1 ヒント',
    fastEntry: '連続入力'
  },
  board: {
    pausedTitle: 'ゲームが一時停止されました',
    tapToResume: 'タップして再開 ▶️',
    resumeTooltip: 'タッチして再開',
    // D47: what a screen reader says for a board cell (utils/cellLabel.js).
    cellAria: '{row}行目 {col}列目：{content}',
    cellAriaCage: '{row}行目 {col}列目：{content}、ケージの合計 {sum}',
    cellEmpty: '空き',
    cellGiven: '{num}（最初からある数字）',
    cellNotes: 'メモ {list}',
    // D44: shown instead of a board under 144px (a split-screen half on a phone).
    tooShort: 'ウィンドウの高さが足りず、盤面を表示できません。高くするとまた表示されます。'
  },
  themes: {
    clay: '🏺 ウォームセラミック＆クレイ',
    matteDark: '🌌 ソフトマットレジンダーク',
    pureCeramic: '🧊 ピュアクレイモフィズム',
    editorial: '📰 クラシックピュアペーパー'
  },
  conflicts: {
    boxDuplicate: '⚠️ [{box} 3x3ブロック]にすでに{num}があります！ {suffix}',
    rowDuplicate: '⚠️ {row}行目にすでに{num}があります！ {suffix}',
    colDuplicate: '⚠️ {col}列目にすでに{num}があります！ {suffix}',
    multipleDuplicates: '⚠️ 同じ3x3ブロック・行・列にすでに{num}があります！ {suffix}',
    notSolution: '⚠️ {num}はこのマスの正解ではありません！ {suffix}',
    cageDuplicate: '⚠️ このケージにはすでに{num}があります！ {suffix}',
    cageSum: '⚠️ このケージの合計が{sum}になりません！ {suffix}',
    boardFullHasMistakes: '⚠️ ボードが埋まりましたが、間違いがあります。もう一度確認してください！',
    timeAttackSuffix: '(不正解 {count}回 | +10秒ペナルティ)',
    classicSuffix: '(ミス {count}/3)',
    // Classic with the three-mistake limit switched off: no limit to count to, no time penalty.
    freeSuffix: '(ミス {count})'
  },
  tiers: {
    grandMaster: {
      title: '👑 グランドマスター',
      desc: '最高ランクに到達しました。'
    },
    expert: {
      title: '🧠 達人',
      desc: '高難度のパズルを安定して解いています。'
    },
    superior: {
      title: '⚡ 上級者',
      desc: '上級のパズルにも挑める実力です。'
    },
    aboveAverage: {
      title: '💡 中級者',
      desc: '着実に腕を上げています。'
    },
    balanced: {
      title: '🎯 バランス型',
      desc: '5つのプレイ指標がバランスよく伸びています。'
    },
    developing: {
      title: '🌱 ビギナー',
      desc: 'プレイを続けるほどスコアが上がります。'
    }
  },
  // D38 (2026-11-06): shown by the page itself, before the app loads, when the WebView is older
  // than the build supports (scripts/build/webviewNotice.js). Read at build time, not by the app.
  webviewUpdate: {
    title: 'Android System WebView を更新してください',
    body: 'このゲームは Android System WebView で画面を表示しています。この端末の WebView は古いため、画面が正しく表示されません。Google Play で更新してから、ゲームをもう一度開いてください。',
    update: 'Google Play を開く',
    continue: 'このまま続ける'
  }
};
