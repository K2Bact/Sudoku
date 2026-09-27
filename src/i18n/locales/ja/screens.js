export const screens = {
  game: {
    ghost: {
      "ahead": "{time} リード",
      "behind": "{time} 遅れ",
      "ghostHintNotice": "💡 ヒントを使用したため、今回のプレイは自己ベストの更新対象外です。"
    },
  },
  home: {
    scoreLabel: 'ロジックスコア',
    title: 'ナンプレ',
    badge: 'PRO',
    hintTooltip: '保有ヒント',
    brainReportTitle: 'プレイ分析',
    brainPercentileShort: 'クリア {won}回',
    startSelectedLevel: 'Lv.{level} {name} 開始',
    modeTabs: { classic: 'クラシック', timeAttack: 'タイムアタック', timeLimit: 'サバイバル' },
    rivalModes: {
      "standard": "🎯 通常",
      "ghost": "👻 ゴースト",
      "delta": "⚡ デルタ",
      "lockedToast": "この難易度を1回以上クリアすると解放されます。",
      "timeLimitToast": "サバイバルモードではゴースト・デルタタイムは使えません。",
      "infoAria": "ゴースト・デルタタイムの説明",
      "infoGhost": "記録を出したその盤をもう一度解き、当時の自分と競います。",
      "infoDelta": "新しい盤で、自己ベストのペースより何秒速いかを表示します。",
},
    modes: {
      classic: { badge: 'クラシック', title: 'クラシックシングル', desc: '落ち着いて論理を組み立てる正統派ナンプレ', startBtn: '新規ゲーム' },
      timeAttack: { badge: 'タイムアタック', title: '⚡ タイムアタック', desc: '1秒でも早い最速クリア記録に挑戦！', startBtn: 'タイムアタック開始' },
      timeLimit: { badge: 'サバイバル', title: '⏳ サバイバル', desc: 'Lv.{level} 制限時間 {minutes}分！ 時間内にパズルを完成させよう！', startBtn: 'サバイバル開始' },
      daily: { title: '本日のデイリー', desc: '毎日新しいパズル＆月間マスターバッジ', badge: 'NEW' },
      battle: { title: '1v1 オンライン対戦', desc: 'リアルタイム1v1対戦' },
      aiBattle: { title: 'AI ボット対戦', desc: '1:1 AI スピード対決' },
      academy: { title: 'ナンプレアカデミー', desc: '32の実戦解法テクニックを習得' },
      practice: { title: '自由練習モード', desc: 'ミス無制限でリラックスプレイ' }
    },
    nav: {brain: '分析', stats: '統計', academy: 'アカデミー', settings: '設定' }
  },
  daily: {
    header: 'デイリーチャレンジ ({month})',
    badgeTitle: '{month}のマスターバッジ',
    badgeDesc: '{completed}/{target} · 目標15',
    unlockingAd: '📺 広告視聴中... 過去のパズルのロックを解除',
    calendarTitle: '📅 365日カレンダー',
    futureAlert: '未来の日付のパズルは、まだロックが解除されていません。',
    pastUnlockNotice: '💡 見逃した過去の日付(🔒)は、短い広告を視聴することでいつでもロックを解除してスタンプを獲得できます。',
    unlockModalTitle: '過去のデイリーパズルのロック解除',
    unlockModalDesc: '{date} のパズルは過去のチャレンジです。\n短い広告を視聴するとすぐにロックを解除してプレイできます。\n広告を視聴しますか？',
    unlockModalConfirmBtn: '📺 広告を見て解除',
    unlockModalCancelBtn: 'キャンセル',
    missionCardTitle: '🎯 本日のカスタムミッション',
    missionCompleted: '本日のミッション達成！✅',
    missionStartBtn: 'ミッションに挑戦 🚀',
    missionReward: 'ヒント1個＋カレンダーにクリア記録',
    tiers: { beginner: '初級', intermediate: '中級', advanced: 'マスター' },
    missions: {
      beginnerLv1Title: '【Lv.1 入門】ナンプレ1回クリア', beginnerLv1Desc: 'Lv.1 入門難易度をクリアして基礎論理力を鍛えましょう。',
      beginnerLv2Title: '【Lv.2 初級】ナンプレ1回クリア', beginnerLv2Desc: 'Lv.2 初級パズルをクリアしてナンプレの基本を固めましょう。',
      medLv3Title: '【Lv.3 中級以上】ナンプレ1回クリア', medLv3Desc: 'Lv.3 中級以上のパズルをクリアして本格的な推理力を試しましょう。',
      advLv4Title: '【Lv.4 上級以上】ナンプレ1回クリア', advLv4Desc: 'Lv.4 以上の高難度パズルを撃破しマスター級の論理力を証明しましょう。',
      advLv5Title: '【Lv.5 達人】ナンプレ1回クリア', advLv5Desc: '最高難度の「Lv.5 達人」のパズルをクリアして、最上位ランクに挑戦しましょう。',
      battleTitle: '1v1 オンライン/AI 対戦に1回参加', battleDesc: 'リアルタイム1v1対戦またはAIボット練習マッチに1回参加しましょう。',
      speedrunTitle: '⚡ タイムアタック1回クリア', speedrunDesc: 'タイムアタックモードでコンボ加速を活かしてクリアしましょう。'
    }
  },
  removeAds: {
    title: '広告削除＆プレミアム',
    heroTitle: '快適なナンプレ体験をお楽しみください',
    heroDesc: '下部バナー広告とゲーム終了後の全画面広告を永久に削除します。',
    benefitsTitle: '👑 プレミアムメンバーシップ特典',
    benefit1: 'すべてのバナーおよび全画面広告を完全削除',
    benefit2: '集中力を最大化し端末のバッテリーを節約',
    benefit3: 'インディー開発チームへの支援と継続的な更新',
    buyBtn: '永久広告削除を購入 ({price})',
    restoreBtn: '購入履歴の復元',
    alreadyPurchased: 'すでにプレミアムメンバーシップをお持ちです！ 🎉',
    processing: '💳 決済処理中...',
    purchaseBtn: '広告を永久削除',
    buySuccess: '購入が正常に完了しました！ありがとうございます。',
    restoreSuccess: '購入履歴が正常に復元されました。',
    restoreFail: '復元可能な購入履歴が見つかりません。',
    buyFail: '購入を完了できませんでした。しばらくしてからもう一度お試しください。'
  },
  tutorialOverlay: {
    exitTooltip: 'チュートリアル終了',
    step1Title: '🎯 ステップ1: マス選択と数字入力',
    step1Desc: 'ハイライトされた [1行目・3列目] の空きマスをタップし、キーパッドで [9] を入力！',
    step2Title: '✏️ ステップ2: メモ（候補数字の入力）',
    step2Desc: 'ツールバーで [メモ] をONにしてメモ入力モードに切り替え、[3] をメモ！',
    step3Title: '🔒 ステップ3: 連続入力モード',
    step3Desc: '連続入力ボタンで [4] を固定し、空いているマスを連続タップして素早く入力！',
    step4Title: '🎉 ステップ4: チュートリアル完了！',
    step4Desc: 'おめでとうございます！マス入力、メモ、連続入力をマスターしました。',
    finishBtn: '実戦ゲームを開始',
    nextBtn: '次へ'
  },
  settings: {
    title: '設定',
    themeSection: '🎨 ビジュアルテーマ',
    languageSection: '🌐 言語設定',
    languages: {
      auto: 'システム'
    },
    gameplaySection: '🎮 ゲームプレイルール',
    limitMistakes: 'ミス3回制限（ハート）',
    limitMistakesDesc: "3回間違えるとゲームオーバー。オフにするとベスト記録は保存されません",
    autoCheck: '誤答の自動判定',
    autoCheckDesc: '間違った数字を入力すると、すぐに赤色で表示します',
    soundSection: '🔊 サウンド＆バイブレーション',
    soundFx: '効果音',
    soundFxDesc: '数字入力音およびボタンタッチ音',
    hapticFx: '触覚フィードバック（振動）',
    hapticFxDesc: '正解および誤答入力時の振動',
    adPrivacyBtn: '広告のプライバシー設定',
    adPrivacyDesc: 'パーソナライズ広告の同意を変更します',
    resetData: 'すべてのローカルデータを初期化',
    resetDataDesc: 'すべてのローカルゲーム統計と記録を初期化',
    resetConfirm: '⚠️ 警告: すべてのプレイ記録、保有ヒント、プレイ分析の記録が完全に削除されます。よろしいですか？',
    resetSuccess: 'データが正常に初期化されました。',
    privacySection: '🛡️ プライバシー保護',
    privacyPolicyBtn: 'ポリシーを表示',
    privacySubtitle: 'プライバシー保護',
    privacyModalTitle: 'プライバシーポリシー',
    privacy: {
      subtitle: 'ナンプレはアカウントなしで遊べます。アプリが実際に保存・送信する情報は以下のとおりです。',
      sec1Title: '1. 端末への保存とバックアップ', sec1Desc: "記録・ヒント・設定はお使いの端末に保存されます。Play ゲームにログインしていない場合、この端末にのみ残ります。氏名・メールアドレス・電話番号・連絡先・位置情報は収集しません。",
      sec2Title: '2. Google Play ゲーム', sec2Desc: 'Play ゲームにログインしている場合、勝利するたびに進行状況（成績・実績・ヒント・設定）がPlay ゲームのセーブデータに自動でバックアップされ、ロジックスコアがPlay ゲームのリーダーボードに送信されます。これらのデータはご自身のGoogleアカウントに保管されます。',
      sec3Title: '3. 1v1対戦', sec3Desc: 'リアルタイムの1v1対戦では、Google Firebaseを通じて、ランダムに生成したプレイヤーID、自動で付くニックネーム（Player_xxxx）、パズルの進行状況を対戦相手に送信します。IDは端末に保存されて再利用されますが、氏名やアカウントとは結び付きません。',
      sec4Title: '4. 広告と購入', sec4Desc: '本アプリはGoogle AdMobを通じて、バナー広告、勝利後の全画面広告、任意で視聴するリワード広告を表示します。AdMobは広告IDを処理する場合があります。広告削除の購入はGoogle Playが処理し、開発者が決済情報を受け取ることはありません。'
    }
  },
  stats: {
    classicBest: "クラシック最高記録",
    speedrunBest: "タイムアタック最高記録",
    survivalTitle: "⏳ タイムリミット (サバイバル)",
    survivalTotalWins: "サバイバルのクリア回数",
    survivalWinsUnit: "{count}回 成功",
    summaryTitle: '総合成績サマリー',
    pvpRating: "レーティング",
    pvpRecordLabel: "戦績",
    pvpRecord: "{wins}勝 · {losses}敗",
    totalPlayed: '総プレイ数',
    totalWon: '総クリア数',
    winRate: '勝率'
  },
  brainReport: {
    scoreLabel: 'ロジックスコア',
    scoreHowTitle: "ⓘ ロジックスコアの決まり方",
    scoreHowBody: "盤面をすべて埋めて勝つと上がります。ヒントなしでクリアした最も難しいレベルが最も大きく反映され、勝利数と勝率も少し反映されます。ゲームオーバーになったり、途中でやめたりすると、勝率が下がり、スコアが少し下がることがあります。ランキングは Play ゲームにログインしているとき、このスコアで決まります。",
    shareText: "[ナンプレ プレイ分析]\nロジックスコア: {iq}点\nランク: {tier}\nあなたもナンプレに挑戦してみよう！",
    copiedToast: "分析レポートをクリップボードにコピーしました。",
    focus: "ノーミス度",
    durability: "やり込み度",
    accuracy: "クリア率",
    logic: "難易度",
    speed: "スピード",
    shareCardBtn: '🔗 レポート共有',
    attributesTitle: "📈 5つのプレイ指標",
    title: 'プレイ分析',
    shareTitle: '私のナンプレ プレイ分析',
    tiers: {
      grandMaster: '👑 グランドマスター',
      grandMasterDesc: '最高ランクに到達しました。',
      expert: '🧠 達人',
      expertDesc: '高難度のパズルを安定して解いています。',
      superior: '⚡ 上級者',
      superiorDesc: '上級のパズルにも挑める実力です。',
      aboveAverage: '💡 中級者',
      aboveAverageDesc: '着実に腕を上げています。',
      balanced: '🎯 バランス型',
      balancedDesc: '5つのプレイ指標がバランスよく伸びています。',
      developing: '🌱 ビギナー',
      developingDesc: 'プレイを続けるほどスコアが上がります。'
    }
  },
  battleLobby: {
    title: '1v1 リアルタイムバトル',
    cancelBtn: 'マッチング取消',
    searching: '対戦相手を探しています...',
    autoMatchTitle: 'リアルタイム高速マッチ',
    autoMatchDesc: 'オンラインのプレイヤーと1:1スピード対戦',
    mmrBadge: 'あなたのクリア率 {rate}%',
    findOpponentBtn: '対戦相手を探す',
    noOpponentFound: '対戦相手が見つかりませんでした。AIと対戦しますか?',
    playAiInstead: 'AIと対戦'
  },
  battleResult: {
    victoryTitle: '1v1 バトル勝利！',
    defeatTitle: '1v1 バトル敗北',
    aiVictoryTitle: 'AIボット戦 勝利！',
    aiDefeatTitle: 'AIボット戦 敗北',
    victoryDesc: '{opponent} さんとの対戦でパズルを先に完成させ勝利しました！',
    victoryMistakeDesc: '{opponent} さんがミス3回で脱落し、勝利しました！',
    defeatDesc: '{opponent} さんが先にパズルを完成させました。',
    defeatMistakeDesc: 'ミス3回により失格となりました。',
    disqualified: '💀 失格',
    finalProgress: '最終進捗',
    ratingChange: '1v1 MMR レーティング変動',
    aiModeLabel: 'AIボット練習対戦 (Lv.{level})',
    aiWonBadge: '練習 勝利',
    aiLostBadge: '練習 完了',
    you: '自分',
    opponent: '相手',
    lobbyBtn: 'バトルロビー',
    aiLobbyBtn: 'AI 対戦メニュー',
    rematchBtn: '再戦を申請',
    aiRematchBtn: 'もう一度挑戦',
    rematchWaitingBtn: '申請中... ({seconds}s)',
    rematchAcceptedToast: '🎉 再戦が承諾されました！ 新しいゲームを開始します。',
    rematchRejectedToast: '相手が再戦を拒否しました。',
    rematchOpponentLeftToast: '相手が対戦ルームを退出しました。',
    homeBtn: 'ホームに戻る'
  },
  rematchToast: {
    title: '{opponent} さんから再戦の申し込みが届きました！',
    countdown: '{seconds}s',
    acceptBtn: '承諾',
    declineBtn: '辞退'
  },
  battleHeader: {
    confirmLeave: '対戦を諦めてホームに戻りますか？',
    emptyCellsLeft: '残り'
  },
  aiBattleScreen: {
    selectLevelTitle: 'AI 難易度選択',
    selectLevelDesc: '自分の実力に合わせたAIボットを選択してください。',
    aiSpeed: '解答速度: {speed}',
    level1Desc: '初級ボット: ゆっくり解いて基本を学べる初心者向けボットです。',
    level2Desc: '一般ボット: 安定したペースで解き進め、ミスもほとんどありません。',
    level3Desc: '熟練ボット: 速いペースで、ミスは少なめです。',
    level4Desc: 'マスターボット: 非常に速いペースで、ミスはまれです。',
    level5Desc: 'グランドマスターボット: 最も速く、ミスの最も少ないボットです。',
    startBtn: 'Lv.{level} {name}と対戦'
  },
  academy: {
    tabs: { stage1: '第1段階', stage2: '第2段階', stage3: '第3段階', stage4: '第4段階', stage5: '第5段階' },
    stageTitles: {"stage1":"第1段階: 初級テクニック (シングル)","stage2":"第2段階: 中級テクニック (ロックト・キャンディデート＆ペア)","stage3":"第3段階: 上級テクニック (ウィング＆BUG)","stage4":"第4段階: 名人テクニック (フィッシュ＆カラーリング)","stage5":"第5段階: グランドマスター (AIC・ALS・エクソセ)"},
    title: 'ナンプレアカデミー',
    theoryBoard: {
      patternTab: 'パターン',
      resultTab: '結果',
      patternCaption: '色付きのマスがこの解法のパターンです。実践例 1 と同じ盤面です。',
      resultCaption: '赤く表示された候補が、このパターンで消えます。',
      placeCaption: 'このパターンにより、強調された数字がそのマスの答えに決まります。'
    },
    practiceUi: {
      theory: '理論解説',
      practice1: '実践練習 1',
      practice2: '実践練習 2',
      success: '正解 [{val}] です！テクニックを完全にマスターしました！',
      retry: 'もう一度挑戦',
      error: '[{val}] は正解ではありません。盤面の数字と解説をもう一度確認してください。',
      prompt: '👇 下の数字キーパッドから目標マス (?) に入る数字をタップしてください。',
      promptEliminated: '👇 目標マスから消える候補の数字をタップしてください。'
    }
  },
  adBanner: {removeBtn: '広告非表示' }
};
