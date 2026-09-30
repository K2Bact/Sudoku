export const achievements = {
  achievements: {
    categories: {
      all: 'すべて',
      progression: 'クリア・成長',
      logic: '論理・ノーミス',
      speed: 'スピード',
      difficulty: '難易度・生存',
      special: 'デイリー・対戦'
    },
    unlockedToast: '実績達成！',
    tabTitle: '実績',
    statsTab: '統計',
    unlockedCount: '{unlocked} / {total} 達成 ({pct}%)',
    lockedBadge: '未達成',
    pointsTotal: '{count}pt',
    tiers: { bronze: 'ブロンズ', silver: 'シルバー', gold: 'ゴールド', diamond: 'ダイヤモンド', master: 'マスター' },
    unlockedAt: '達成日: {date}',

    // 1 ~ 7. 完走 & 進行
    first_win: { title: '第一歩', desc: '難易度を問わず初めてナンプレパズルをクリア' },
    win_5: { title: 'ブロンズパズラー', desc: '累計5パズルクリア達成' },
    win_10: { title: 'ナンプレ愛好家', desc: '累計10パズルクリア達成' },
    win_25: { title: 'シルバーパズラー', desc: '累計25パズルクリア達成' },
    win_50: { title: 'ゴールドベテラン', desc: '累計50パズルクリア達成' },
    win_100: { title: 'センチュリークラブ', desc: '累計100パズルクリア達成' },
    win_250: { title: 'ナンプレの生ける伝説', desc: '累計250パズルクリア達成' },

    // 8 ~ 14. 論理 & ノーミス
    flawless_1: { title: 'パーフェクトマスター', desc: '1度もミスすることなく(誤答0回)パズルをクリア' },
    flawless_5: { title: '完璧主義者', desc: '誤答0回のパーフェクトクリアを5回達成' },
    pure_logic_expert: { title: '純粋論理の境地', desc: 'ヒントを1度も使わずにLv.4 上級をクリア' },
    pure_logic_master: { title: '究極のマインド', desc: 'ヒントもミスもなしにLv.5 達人をクリア' },
    note_master: { title: 'メモの達人', desc: 'メモ機能を50回以上活用' },
    no_notes: { title: '直感の眼', desc: 'メモを一切使わずにLv.3 中級以上をクリア' },
    fast_entry_fan: { title: '電光石火', desc: '連続入力モードで1パズルクリア' },

    // 15 ~ 19. スピード & コンボ
    rank_s_plus: { title: '神速の境地', desc: 'タイムアタックで 👑 S+ ランクを初獲得' },
    speed_runner_3m: { title: '3分以内クリア', desc: '3分(180秒)以内にパズルをクリア' },
    speed_runner_2m: { title: '電光石火の速攻', desc: '2分(120秒)以内の超高速クリアを達成' },
    combo_streak_5: { title: 'コンボアーティスト', desc: 'タイムアタックモードで5連続コンボ達成' },
    combo_streak_10: { title: 'コンボマエストロ', desc: 'タイムアタックモードで10連続コンボ達成' },

    // 20 ~ 26. 難易度制覇 & サバイバル
    clear_lv1: { title: '入門制覇', desc: '「Lv.1 入門」のパズルをクリア' },
    clear_lv2: { title: '簡単マスター', desc: '「Lv.2 初級」のパズルをクリア' },
    clear_lv3: { title: '中級者の仲間入り', desc: '「Lv.3 中級」のパズルをクリア' },
    clear_lv4: { title: '上級制覇者', desc: '「Lv.4 上級」のパズルをクリア' },
    clear_lv5: { title: 'グランドマスター', desc: '最高難易度の「Lv.5 達人」をクリア' },
    survival_hero: { title: 'タイムサバイバー', desc: 'タイムリミット(サバイバル)モードをクリア' },
    survival_clutch: { title: '九死に一生', desc: '残り時間5秒以下の危機を乗り越えてクリア' },

    // 27 ~ 30. デイリー, バトル & 脳力
    daily_first: { title: 'デイリー探検家', desc: '本日のデイリーチャレンジを初クリア' },
    daily_streak_7: { title: '7日間の奇跡', desc: '7日連続でログインする' },
    battle_first_win: { title: '剣闘士の初勝利', desc: '1v1オンライン対戦またはAI対戦で初勝利' },
    iq_150: { title: 'ロジックの達人', desc: 'ロジックスコア150点以上に到達' }
  }
};
