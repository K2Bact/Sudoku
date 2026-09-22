import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const OUT_DIR = 'store_assets/ko-KR';
if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

async function renderHtmlToImage(browser, html, width, height, outputPath) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1
  });
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(300);
  await page.screenshot({ path: outputPath, type: 'png' });
  await page.close();
  console.log(`✅ Generated: ${outputPath} (${width}x${height})`);
}

async function main() {
  console.log('🎨 Generating High-Resolution Toss Store Assets in', OUT_DIR, '...');
  const browser = await chromium.launch({ headless: true });

  // 1. 앱 로고 (600x600)
  const logoHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 600px; height: 600px;
        background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%);
        display: flex; align-items: center; justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", sans-serif;
      }
      .icon-card {
        width: 440px; height: 440px;
        background: #ffffff;
        border-radius: 96px;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.25), inset 0 -8px 16px rgba(0, 0, 0, 0.05);
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 12px;
        padding: 40px;
      }
      .cell {
        background: #f1f5f9;
        border-radius: 20px;
        display: flex; align-items: center; justify-content: center;
        font-size: 52px; font-weight: 900; color: #1e293b;
        box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.1);
      }
      .cell.highlight {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #ffffff;
        box-shadow: 0 6px 14px rgba(37, 99, 235, 0.4);
      }
      .cell.accent {
        background: #e0e7ff;
        color: #3730a3;
      }
    </style>
  </head>
  <body>
    <div class="icon-card">
      <div class="cell highlight">9</div>
      <div class="cell">2</div>
      <div class="cell accent">7</div>
      <div class="cell">4</div>
      <div class="cell highlight">5</div>
      <div class="cell">6</div>
      <div class="cell accent">1</div>
      <div class="cell">8</div>
      <div class="cell highlight">3</div>
    </div>
  </body>
  </html>
  `;
  await renderHtmlToImage(browser, logoHtml, 600, 600, join(OUT_DIR, 'toss_app_logo_600x600.png'));

  // 2. 다크모드 앱 로고 (600x600)
  const darkLogoHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 600px; height: 600px;
        background: #0f172a;
        display: flex; align-items: center; justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Segoe UI", sans-serif;
      }
      .icon-card {
        width: 440px; height: 440px;
        background: #1e293b;
        border: 2px solid #334155;
        border-radius: 96px;
        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.1);
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 12px;
        padding: 40px;
      }
      .cell {
        background: #0f172a;
        border-radius: 20px;
        display: flex; align-items: center; justify-content: center;
        font-size: 52px; font-weight: 900; color: #94a3b8;
        border: 1px solid #1e293b;
      }
      .cell.highlight {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: #ffffff;
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
      }
      .cell.accent {
        background: #1e1b4b;
        color: #818cf8;
        border-color: #312e81;
      }
    </style>
  </head>
  <body>
    <div class="icon-card">
      <div class="cell highlight">9</div>
      <div class="cell">2</div>
      <div class="cell accent">7</div>
      <div class="cell">4</div>
      <div class="cell highlight">5</div>
      <div class="cell">6</div>
      <div class="cell accent">1</div>
      <div class="cell">8</div>
      <div class="cell highlight">3</div>
    </div>
  </body>
  </html>
  `;
  await renderHtmlToImage(browser, darkLogoHtml, 600, 600, join(OUT_DIR, 'toss_dark_app_logo_600x600.png'));

  // 3. 썸네일 (1932x828)
  const thumbnailHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1932px; height: 828px;
        background: linear-gradient(135deg, #0b132b 0%, #1c2541 60%, #1e3a8a 100%);
        display: flex; align-items: center; justify-content: space-between;
        padding: 80px 120px;
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", sans-serif;
        color: #ffffff;
        position: relative;
        overflow: hidden;
      }
      .glow-circle {
        position: absolute; width: 600px; height: 600px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, rgba(0,0,0,0) 70%);
        top: -100px; right: 200px;
      }
      .left-content {
        max-width: 900px;
        z-index: 2;
      }
      .badge-row {
        display: flex; gap: 14px; margin-bottom: 24px;
      }
      .pill-badge {
        background: rgba(59, 130, 246, 0.2);
        border: 1.5px solid #3b82f6;
        color: #60a5fa;
        font-size: 24px; font-weight: 800;
        padding: 8px 24px; border-radius: 40px;
      }
      .pill-badge.yellow {
        background: rgba(234, 179, 8, 0.2);
        border-color: #eab308;
        color: #fde047;
      }
      h1 {
        font-size: 72px; font-weight: 900; line-height: 1.25; margin-bottom: 24px;
        letter-spacing: -1px;
      }
      h1 span {
        background: linear-gradient(135deg, #60a5fa, #93c5fd);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      p {
        font-size: 32px; color: #94a3b8; line-height: 1.5; font-weight: 500;
      }
      .right-content {
        z-index: 2;
        display: flex; flex-direction: column; align-items: center;
      }
      .board-card {
        width: 480px; height: 480px;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 48px;
        box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4), 0 0 0 12px rgba(255, 255, 255, 0.1);
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(3, 1fr);
        gap: 12px;
        padding: 36px;
        transform: rotate(-4deg);
      }
      .cell {
        background: #f8fafc;
        border-radius: 20px;
        display: flex; align-items: center; justify-content: center;
        font-size: 56px; font-weight: 900; color: #1e293b;
        box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.08);
      }
      .cell.blue {
        background: #2563eb; color: #ffffff;
      }
      .cell.gold {
        background: #f59e0b; color: #ffffff;
      }
    </style>
  </head>
  <body>
    <div class="glow-circle"></div>
    <div class="left-content">
      <div class="badge-row">
        <div class="pill-badge yellow">🔥 365 데일리 챌린지</div>
        <div class="pill-badge">🧠 두뇌 IQ 리포트</div>
      </div>
      <h1>매일 두뇌가 젊어지는<br><span>정통 스도쿠 퍼즐</span></h1>
      <p>5단계 난이도 · 32가지 정통 아카데미 · 실시간 AI 스피드전</p>
    </div>
    <div class="right-content">
      <div class="board-card">
        <div class="cell blue">5</div>
        <div class="cell">3</div>
        <div class="cell gold">7</div>
        <div class="cell">6</div>
        <div class="cell blue">1</div>
        <div class="cell">9</div>
        <div class="cell gold">8</div>
        <div class="cell">4</div>
        <div class="cell blue">2</div>
      </div>
    </div>
  </body>
  </html>
  `;
  await renderHtmlToImage(browser, thumbnailHtml, 1932, 828, join(OUT_DIR, 'toss_thumbnail_1932x828.png'));

  // 4. 세로형 스크린샷 4장 (636 x 1048)
  // Screenshot 1: 365 데일리 챌린지
  const ss1 = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 636px; height: 1048px;
        background: #f8fafc;
        display: flex; flex-direction: column; align-items: center; justify-content: space-between;
        padding: 50px 36px 40px;
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif;
      }
      .header-text { text-align: center; }
      .tag { display: inline-block; background: #dbeafe; color: #1d4ed8; font-size: 16px; font-weight: 800; padding: 6px 16px; border-radius: 20px; margin-bottom: 12px; }
      h2 { font-size: 34px; font-weight: 900; color: #0f172a; line-height: 1.3; }
      .app-preview {
        width: 100%; height: 740px;
        background: #ffffff;
        border: 3px solid #e2e8f0;
        border-radius: 36px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        padding: 24px;
        display: flex; flex-direction: column; gap: 16px;
      }
      .cal-card {
        background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px;
      }
      .cal-header { display: flex; justify-content: space-between; font-weight: 800; font-size: 20px; color: #1e293b; margin-bottom: 16px; }
      .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; text-align: center; }
      .day-name { font-size: 13px; font-weight: 700; color: #94a3b8; }
      .day-cell { height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 700; background: #ffffff; color: #334155; }
      .day-cell.done { background: #2563eb; color: #ffffff; box-shadow: 0 4px 10px rgba(37,99,235,0.3); }
      .mission-box {
        background: linear-gradient(135deg, #1e293b, #0f172a);
        color: #ffffff; border-radius: 20px; padding: 22px;
      }
      .m-tag { font-size: 13px; color: #fbbf24; font-weight: 800; margin-bottom: 6px; }
      .m-title { font-size: 18px; font-weight: 800; margin-bottom: 8px; }
      .m-desc { font-size: 13px; color: #94a3b8; margin-bottom: 14px; }
      .m-btn { background: #2563eb; color: #ffffff; text-align: center; padding: 14px; border-radius: 14px; font-weight: 800; font-size: 16px; }
    </style>
  </head>
  <body>
    <div class="header-text">
      <div class="tag">📅 매일 새로운 도전</div>
      <h2>365일 데일리 챌린지<br>출석 & 마스터 뱃지</h2>
    </div>
    <div class="app-preview">
      <div class="cal-card">
        <div class="cal-header">
          <span>2026년 8월 챌린지</span>
          <span style="color: #2563eb;">15 / 31 완료</span>
        </div>
        <div class="cal-grid">
          <div class="day-name">일</div><div class="day-name">월</div><div class="day-name">화</div><div class="day-name">수</div><div class="day-name">목</div><div class="day-name">금</div><div class="day-name">토</div>
          <div class="day-cell done">1</div><div class="day-cell done">2</div><div class="day-cell done">3</div><div class="day-cell done">4</div><div class="day-cell done">5</div><div class="day-cell done">6</div><div class="day-cell done">7</div>
          <div class="day-cell done">8</div><div class="day-cell done">9</div><div class="day-cell done">10</div><div class="day-cell done">11</div><div class="day-cell done">12</div><div class="day-cell done">13</div><div class="day-cell done">14</div>
          <div class="day-cell done">15</div><div class="day-cell" style="border: 2px solid #2563eb; color: #2563eb;">16</div><div class="day-cell">17</div><div class="day-cell">18</div><div class="day-cell">19</div><div class="day-cell">20</div><div class="day-cell">21</div>
        </div>
      </div>
      <div class="mission-box">
        <div class="m-tag">🎯 오늘의 특별 미션</div>
        <div class="m-title">[Lv.3 중급] 스도쿠 1회 클리어</div>
        <div class="m-desc">논리적 사고력을 발휘해 중급 퍼즐을 완성하세요.</div>
        <div class="m-btn">미션 시작하기 🚀</div>
      </div>
    </div>
  </body>
  </html>
  `;
  await renderHtmlToImage(browser, ss1, 636, 1048, join(OUT_DIR, 'toss_screenshot_portrait_01.png'));

  // Screenshot 2: 5단계 스도쿠
  const ss2 = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 636px; height: 1048px;
        background: #f8fafc;
        display: flex; flex-direction: column; align-items: center; justify-content: space-between;
        padding: 50px 36px 40px;
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif;
      }
      .header-text { text-align: center; }
      .tag { display: inline-block; background: #fef3c7; color: #b45309; font-size: 16px; font-weight: 800; padding: 6px 16px; border-radius: 20px; margin-bottom: 12px; }
      h2 { font-size: 34px; font-weight: 900; color: #0f172a; line-height: 1.3; }
      .game-preview {
        width: 100%; height: 740px;
        background: #ffffff;
        border: 3px solid #e2e8f0;
        border-radius: 36px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        padding: 20px;
        display: flex; flex-direction: column; justify-content: space-between;
      }
      .game-top { display: flex; justify-content: space-between; align-items: center; padding: 0 6px; font-weight: 800; font-size: 18px; color: #334155; }
      .board-grid {
        width: 100%; aspect-ratio: 1;
        background: #ffffff; border: 2.5px solid #0f172a; border-radius: 16px;
        display: grid; grid-template-columns: repeat(9, 1fr);
        box-shadow: 0 8px 24px rgba(0,0,0,0.06);
      }
      .cell {
        display: flex; align-items: center; justify-content: center;
        font-size: 24px; font-weight: 800; color: #0f172a;
        border-right: 1px solid #cbd5e1; border-bottom: 1px solid #cbd5e1;
      }
      .cell:nth-child(3n) { border-right: 2px solid #0f172a; }
      .cell:nth-child(9n) { border-right: none; }
      .cell.selected { background: #dbeafe; color: #1d4ed8; font-weight: 900; }
      .cell.related { background: #f1f5f9; }
      .cell.user-val { color: #2563eb; font-weight: 900; }
      .keypad-grid {
        display: grid; grid-template-columns: repeat(9, 1fr); gap: 6px;
      }
      .key-btn {
        height: 54px; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        font-size: 22px; font-weight: 900; color: #1e293b;
        box-shadow: 0 3px 0 #cbd5e1;
      }
      .actions-row { display: flex; justify-content: space-around; font-size: 14px; font-weight: 700; color: #64748b; }
      .action-pill { background: #f1f5f9; padding: 8px 16px; border-radius: 14px; }
    </style>
  </head>
  <body>
    <div class="header-text">
      <div class="tag">⚡ 몰입감 넘치는 손맛</div>
      <h2>5단계 난이도 스도쿠<br>메모 & 스마트 힌트</h2>
    </div>
    <div class="game-preview">
      <div class="game-top">
        <span>Lv.3 보통</span>
        <span style="color: #2563eb;">⏱️ 02:45</span>
        <span style="color: #ef4444;">실수 0/3</span>
      </div>
      <div class="board-grid">
        <div class="cell related">5</div><div class="cell related">3</div><div class="cell selected">4</div><div class="cell">6</div><div class="cell">7</div><div class="cell">8</div><div class="cell">9</div><div class="cell">1</div><div class="cell">2</div>
        <div class="cell">6</div><div class="cell">7</div><div class="cell related">2</div><div class="cell">1</div><div class="cell">9</div><div class="cell">5</div><div class="cell">3</div><div class="cell">4</div><div class="cell">8</div>
        <div class="cell">1</div><div class="cell">9</div><div class="cell related">8</div><div class="cell">3</div><div class="cell">4</div><div class="cell">2</div><div class="cell">5</div><div class="cell">6</div><div class="cell">7</div>
        <div class="cell">8</div><div class="cell">5</div><div class="cell related">9</div><div class="cell">7</div><div class="cell">6</div><div class="cell">1</div><div class="cell">4</div><div class="cell">2</div><div class="cell">3</div>
        <div class="cell">4</div><div class="cell">2</div><div class="cell related user-val">6</div><div class="cell">8</div><div class="cell">5</div><div class="cell">3</div><div class="cell">7</div><div class="cell">9</div><div class="cell">1</div>
        <div class="cell">7</div><div class="cell">1</div><div class="cell related">3</div><div class="cell">9</div><div class="cell">2</div><div class="cell">4</div><div class="cell">8</div><div class="cell">5</div><div class="cell">6</div>
        <div class="cell">9</div><div class="cell">6</div><div class="cell related">1</div><div class="cell">5</div><div class="cell">3</div><div class="cell">7</div><div class="cell">2</div><div class="cell">8</div><div class="cell">4</div>
        <div class="cell">2</div><div class="cell">8</div><div class="cell related">7</div><div class="cell">4</div><div class="cell">1</div><div class="cell">9</div><div class="cell">6</div><div class="cell">3</div><div class="cell">5</div>
        <div class="cell">3</div><div class="cell">4</div><div class="cell related">5</div><div class="cell">2</div><div class="cell">8</div><div class="cell">6</div><div class="cell">1</div><div class="cell">7</div><div class="cell">9</div>
      </div>
      <div class="actions-row">
        <div class="action-pill">↩️ 실행 취소</div>
        <div class="action-pill">🧹 지우기</div>
        <div class="action-pill" style="background: #dbeafe; color: #2563eb;">✏️ 메모 ON</div>
        <div class="action-pill">💡 힌트 (3)</div>
      </div>
      <div class="keypad-grid">
        <div class="key-btn">1</div><div class="key-btn">2</div><div class="key-btn">3</div>
        <div class="key-btn" style="background: #2563eb; color: #fff;">4</div><div class="key-btn">5</div><div class="key-btn">6</div>
        <div class="key-btn">7</div><div class="key-btn">8</div><div class="key-btn">9</div>
      </div>
    </div>
  </body>
  </html>
  `;
  await renderHtmlToImage(browser, ss2, 636, 1048, join(OUT_DIR, 'toss_screenshot_portrait_02.png'));

  // Screenshot 3: 두뇌 IQ 리포트
  const ss3 = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 636px; height: 1048px;
        background: #f8fafc;
        display: flex; flex-direction: column; align-items: center; justify-content: space-between;
        padding: 50px 36px 40px;
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif;
      }
      .header-text { text-align: center; }
      .tag { display: inline-block; background: #e0e7ff; color: #4338ca; font-size: 16px; font-weight: 800; padding: 6px 16px; border-radius: 20px; margin-bottom: 12px; }
      h2 { font-size: 34px; font-weight: 900; color: #0f172a; line-height: 1.3; }
      .report-preview {
        width: 100%; height: 740px;
        background: #ffffff;
        border: 3px solid #e2e8f0;
        border-radius: 36px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        padding: 24px;
        display: flex; flex-direction: column; justify-content: space-between;
      }
      .iq-hero {
        background: linear-gradient(135deg, #1e3a8a, #2563eb);
        color: #ffffff; border-radius: 24px; padding: 24px; text-align: center;
      }
      .iq-val { font-size: 54px; font-weight: 900; line-height: 1; margin: 8px 0; }
      .iq-tier { font-size: 18px; font-weight: 800; color: #fbbf24; }
      .skills-card {
        background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px;
      }
      .skill-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
      .skill-name { font-size: 15px; font-weight: 700; color: #334155; }
      .skill-bar-wrap { width: 220px; height: 10px; background: #e2e8f0; border-radius: 5px; overflow: hidden; }
      .skill-bar { height: 100%; background: #2563eb; border-radius: 5px; }
      .share-btn {
        background: #0f172a; color: #ffffff; text-align: center; padding: 16px; border-radius: 16px; font-size: 17px; font-weight: 800;
      }
    </style>
  </head>
  <body>
    <div class="header-text">
      <div class="tag">🧠 5대 인지 능력 정밀 분석</div>
      <h2>스도쿠 두뇌 IQ 리포트<br>상위 백분위 & 티어</h2>
    </div>
    <div class="report-preview">
      <div class="iq-hero">
        <div style="font-size: 15px; opacity: 0.9;">나의 스도쿠 두뇌 지수</div>
        <div class="iq-val">142 <span style="font-size: 20px;">IQ</span></div>
        <div class="iq-tier">👑 멘사급 두뇌 (상위 2.4%)</div>
      </div>
      <div class="skills-card">
        <div style="font-weight: 800; font-size: 17px; color: #0f172a; margin-bottom: 16px;">5대 인지 능력 지표</div>
        <div class="skill-row">
          <span class="skill-name">🎯 몰입 집중력</span>
          <div class="skill-bar-wrap"><div class="skill-bar" style="width: 95%;"></div></div>
          <span style="font-weight: 800; color: #2563eb;">95점</span>
        </div>
        <div class="skill-row">
          <span class="skill-name">💡 논리 추론력</span>
          <div class="skill-bar-wrap"><div class="skill-bar" style="width: 92%;"></div></div>
          <span style="font-weight: 800; color: #2563eb;">92점</span>
        </div>
        <div class="skill-row">
          <span class="skill-name">⚡ 처리 속도</span>
          <div class="skill-bar-wrap"><div class="skill-bar" style="width: 88%;"></div></div>
          <span style="font-weight: 800; color: #2563eb;">88점</span>
        </div>
        <div class="skill-row">
          <span class="skill-name">🎯 정확도</span>
          <div class="skill-bar-wrap"><div class="skill-bar" style="width: 96%;"></div></div>
          <span style="font-weight: 800; color: #2563eb;">96점</span>
        </div>
      </div>
      <div class="share-btn">🔗 두뇌 분석 리포트 공유하기</div>
    </div>
  </body>
  </html>
  `;
  await renderHtmlToImage(browser, ss3, 636, 1048, join(OUT_DIR, 'toss_screenshot_portrait_03.png'));

  // Screenshot 4: 32가지 아카데미
  const ss4 = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 636px; height: 1048px;
        background: #f8fafc;
        display: flex; flex-direction: column; align-items: center; justify-content: space-between;
        padding: 50px 36px 40px;
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif;
      }
      .header-text { text-align: center; }
      .tag { display: inline-block; background: #dcfce7; color: #15803d; font-size: 16px; font-weight: 800; padding: 6px 16px; border-radius: 20px; margin-bottom: 12px; }
      h2 { font-size: 34px; font-weight: 900; color: #0f172a; line-height: 1.3; }
      .academy-preview {
        width: 100%; height: 740px;
        background: #ffffff;
        border: 3px solid #e2e8f0;
        border-radius: 36px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        padding: 24px;
        display: flex; flex-direction: column; justify-content: space-between;
      }
      .stage-tab-row { display: flex; gap: 8px; overflow-x: hidden; }
      .stage-chip { background: #f1f5f9; padding: 8px 16px; border-radius: 12px; font-size: 14px; font-weight: 800; color: #64748b; }
      .stage-chip.active { background: #2563eb; color: #ffffff; }
      .lesson-card {
        background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 20px; padding: 20px;
      }
      .lesson-title { font-size: 19px; font-weight: 900; color: #0f172a; margin-bottom: 8px; }
      .lesson-desc { font-size: 14px; color: #475569; line-height: 1.5; margin-bottom: 14px; }
      .practice-box {
        background: #ffffff; border: 2px dashed #93c5fd; border-radius: 16px; padding: 16px; text-align: center; font-weight: 800; color: #1d4ed8; font-size: 15px;
      }
    </style>
  </head>
  <body>
    <div class="header-text">
      <div class="tag">🎓 초보부터 그랜드마스터까지</div>
      <h2>32가지 정통 해법<br>스도쿠 아카데미 레슨</h2>
    </div>
    <div class="academy-preview">
      <div class="stage-tab-row">
        <div class="stage-chip active">1단계 기본기</div>
        <div class="stage-chip">2단계 블록쌍</div>
        <div class="stage-chip">3단계 윙시리즈</div>
      </div>
      <div class="lesson-card">
        <div class="lesson-title">히든 싱글 (Hidden Single)</div>
        <div class="lesson-desc">3x3 박스나 행/열에서 특정 숫자가 들어갈 수 있는 유일한 자리를 찾아내는 핵심 기법입니다.</div>
        <div class="practice-box">
          🎯 실습 문제: [?] 칸에 들어갈 숫자를 찾아보세요!
        </div>
      </div>
      <div class="lesson-card">
        <div class="lesson-title">네이키드 페어 (Naked Pair)</div>
        <div class="lesson-desc">같은 행/열/박스 안에서 2개의 셀이 동일한 2개의 후보 숫자만 가질 때 다른 셀의 후보를 제거합니다.</div>
      </div>
    </div>
  </body>
  </html>
  `;
  await renderHtmlToImage(browser, ss4, 636, 1048, join(OUT_DIR, 'toss_screenshot_portrait_04.png'));

  // 5. 가로형 스크린샷 1장 (1504 x 741)
  const ssLandscape = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1504px; height: 741px;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        display: flex; align-items: center; justify-content: space-between;
        padding: 60px 100px;
        font-family: -apple-system, BlinkMacSystemFont, "Pretendard", sans-serif;
        color: #ffffff;
      }
      .left { max-width: 650px; }
      .pill { display: inline-block; background: #2563eb; color: #fff; padding: 6px 18px; border-radius: 20px; font-weight: 800; font-size: 18px; margin-bottom: 20px; }
      h2 { font-size: 52px; font-weight: 900; line-height: 1.25; margin-bottom: 20px; }
      h2 span { color: #60a5fa; }
      p { font-size: 24px; color: #94a3b8; line-height: 1.5; }
      .right { display: flex; gap: 24px; }
      .card {
        width: 280px; height: 420px; background: #ffffff; color: #0f172a; border-radius: 28px; padding: 24px;
        display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
      }
      .card.dark { background: #1e3a8a; color: #ffffff; }
      .card-title { font-size: 22px; font-weight: 900; margin-bottom: 8px; }
      .card-desc { font-size: 14px; opacity: 0.8; line-height: 1.4; }
    </style>
  </head>
  <body>
    <div class="left">
      <div class="pill">👑 스도쿠 마스터의 선택</div>
      <h2>스도쿠의 모든 것,<br><span>토스에서 1초 만에 플레이</span></h2>
      <p>설치 없이 바로 즐기는 5단계 퍼즐, 365일 데일리 챌린지, 두뇌 IQ 리포트까지!</p>
    </div>
    <div class="right">
      <div class="card">
        <div>
          <div style="font-size: 32px; margin-bottom: 12px;">📅</div>
          <div class="card-title">365 데일리</div>
          <div class="card-desc">매일 달라지는 새로운 문제와 월간 마스터 뱃지 획득</div>
        </div>
        <div style="font-size: 14px; font-weight: 800; color: #2563eb;">출석 체크하기 ➔</div>
      </div>
      <div class="card dark">
        <div>
          <div style="font-size: 32px; margin-bottom: 12px;">🧠</div>
          <div class="card-title">두뇌 IQ 분석</div>
          <div class="card-desc">5대 인지 능력 정밀 측정 및 상위 백분위 리포트</div>
        </div>
        <div style="font-size: 14px; font-weight: 800; color: #60a5fa;">IQ 측정하기 ➔</div>
      </div>
    </div>
  </body>
  </html>
  `;
  await renderHtmlToImage(browser, ssLandscape, 1504, 741, join(OUT_DIR, 'toss_screenshot_landscape_01.png'));

  // 6. 앱 검색 키워드 텍스트 파일
  const keywords = `스도쿠, 스도쿠 무료, 스도쿠 퍼즐, 두뇌 게임, 두뇌 훈련, 치매 예방, 멘사, IQ 테스트, 퍼즐 게임, 숫자 퍼즐, 데일리 스도쿠, 클래식 스도쿠, 365 챌린지, 스피드런, 논리 게임, 수학 퍼즐, 스도쿠 마스터, 두뇌 회전, 기억력 훈련, 집중력 향상`;
  writeFileSync(join(OUT_DIR, 'toss_keywords.txt'), keywords, 'utf8');
  console.log('✅ Generated: store_assets/ko-KR/toss_keywords.txt');

  await browser.close();
  console.log('\n🎉 ALL TOSS ASSETS GENERATED PERFECTLY!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
