import fs from 'fs';

// Traditional Chinese dictionary map for Simplified to Traditional conversion
const SIMP_TO_TRAD = {
  '剩余': '剩餘', '单数': '單數', '数对': '數對', '三数组': '三數組', '四数组': '四數組',
  '剑鱼': '劍魚', '水母': '水母', '实战范例': '實戰範例', '锁定': '鎖定', '确定': '確定',
  '排除': '排除', '笔记': '筆記', '候选数': '候選數', '经典': '經典', '极速冲榜': '極速衝榜',
  '限时生存': '限時生存', '每日挑战': '每日挑戰', '对战': '對戰', '人机对战': '人機對戰',
  '学院': '學院', '设置': '設定', '统计': '統計', '大脑报告': '大腦報告', '返回': '返回',
  '重新开始': '重新開始', '新游戏': '新遊戲', '撤销': '復原', '擦除': '擦除', '提示': '提示',
  '快速填数': '快速填數', '暂停': '暫停', '继续': '繼續', '胜利': '勝利', '失败': '失敗',
  '复活': '復活', '查看排行': '查看排行', '分享': '分享', '确认': '確認', '取消': '取消',
  '难度': '難度', '错误': '錯誤', '时间': '時間', '连击': '連擊', '段位': '段位',
  '门萨': '門薩', '宗师': '宗師', '卓越': '卓越', '中坚': '中堅', '起步': '起步',
  '均衡': '均衡', '深色模式': '深色模式', '浅色模式': '淺色模式', '音效': '音效',
  '振动': '振動', '语言': '語言', '云端同步': '雲端同步', '备份': '備份', '恢复': '恢復',
  '隐私政策': '隱私政策', '无广告': '無廣告', '赞助商': '贊助商', '官方': '官方',
  '对决': '對決', '对手': '對手', '你': '你', '投降': '投降', '平局': '平局'
};

const cnContent = fs.readFileSync('src/i18n/locales/zh-CN/screens.js', 'utf8');

// Basic conversion
let twContent = cnContent;
for (const [s, t] of Object.entries(SIMP_TO_TRAD)) {
  twContent = twContent.replaceAll(s, t);
}

// Ensure emptyCellsLeft: '剩餘'
twContent = twContent.replace(/emptyCellsLeft:\s*['"][^'"]+['"]/g, "emptyCellsLeft: '剩餘'");

fs.writeFileSync('src/i18n/locales/zh-TW/screens.js', twContent, 'utf8');
console.log('✅ Generated clean UTF-8 zh-TW/screens.js');
