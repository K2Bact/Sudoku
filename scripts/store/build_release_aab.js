import { execSync } from 'child_process';
import { copyFileSync, statSync, mkdirSync } from 'fs';
import { join } from 'path';
import { APP_INFO } from '../../src/config/appInfo.js';

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
// 래퍼는 절대경로로 부른다.
//
// `cmd /c "cd android && gradlew ..."` 도, cwd 를 주고 `gradlew.bat` 을 부르는
// 것도, `./gradlew.bat` 도 전부 "명령을 찾을 수 없음" 이었다. 이 컴퓨터의 cmd 는
// 실행 파일 탐색에서 현재 디렉터리를 건너뛴다. 경로를 짐작하게 두지 않는다.
const gradlew = join(process.cwd(), 'android', 'gradlew.bat');
execSync(`"${gradlew}" bundleRelease`, { cwd: 'android', stdio: 'inherit', shell: true });

// 4. Copy to Root Directory with version naming
const aabOutput = 'android/app/build/outputs/bundle/release/app-release.aab';
// 저장소 루트가 아니라 gitignore 된 보관함으로 내보낸다. 예전에 .aab 아홉 개가
// 루트에 커밋되어 281MB 를 차지했고, GitHub 이 100MB 를 넘으면 푸시를 거부하므로
// 다음 릴리스가 막힐 뻔했다. 빌드 산출물은 소스 관리에 들어가지 않는다.
const outDir = 'release_archive';
mkdirSync(outDir, { recursive: true });
const versionedAab = `${outDir}/suidoku-v${APP_INFO.version}-build${APP_INFO.buildCode}.aab`;

copyFileSync(aabOutput, versionedAab);

const sizeMb = (statSync(versionedAab).size / (1024 * 1024)).toFixed(2);
console.log('\n======================================================');
console.log(`🎉 [Build AAB Complete] Successfully exported:`);
console.log(`👉 ${versionedAab} (${sizeMb} MB)`);
console.log('======================================================');
