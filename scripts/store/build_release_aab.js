import { execSync } from 'child_process';
import { copyFileSync, statSync, readFileSync } from 'fs';
import { APP_INFO } from '../src/config/appInfo.js';

// 🛑 HARD SAFEGUARD: Prevent accidental or unauthorized AAB builds
const isAuthorized = process.argv.includes('--force-user-authorized') || process.env.ALLOW_AAB_BUILD === 'true';
if (!isAuthorized) {
  console.error('\n======================================================');
  console.error('⛔ [AAB BUILD BLOCKED BY HARD SAFEGUARD]');
  console.error('사용자의 명시적인 직접 지시("AAB 만들어라 / 빌드해라")가 확인되지 않았습니다.');
  console.error('AI 에이전트의 임의 빌드 실행을 원천 차단합니다.');
  console.error('실행 필요 시: --force-user-authorized 플래그 필수');
  console.error('======================================================\n');
  process.exit(1);
}

console.log(`🚀 [Build AAB] Starting Release Build for ${APP_INFO.name} v${APP_INFO.version} (Build ${APP_INFO.buildCode})...`);

// 1. Build Vite Production Bundle
console.log('📦 1. Building Vite Production Web Bundle...');
execSync('cmd /c "npm run build"', { stdio: 'inherit' });

// 2. Sync Capacitor Android
console.log('🔄 2. Syncing Capacitor Android Assets & Plugins...');
execSync('cmd /c "npx cap sync android"', { stdio: 'inherit' });

// 3. Build Release AAB with Gradle
console.log('🔨 3. Building Signed Release AAB with Gradle...');
execSync('cmd /c "cd android && gradlew bundleRelease"', { stdio: 'inherit' });

// 4. Copy to Root Directory with version naming
const aabOutput = 'android/app/build/outputs/bundle/release/app-release.aab';
const versionedAab = `suidoku-v${APP_INFO.version}-release.aab`;

copyFileSync(aabOutput, versionedAab);

const sizeMb = (statSync(versionedAab).size / (1024 * 1024)).toFixed(2);
console.log('\n======================================================');
console.log(`🎉 [Build AAB Complete] Successfully exported to root:`);
console.log(`👉 ${versionedAab} (${sizeMb} MB)`);
console.log('======================================================');
