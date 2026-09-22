# scripts/archive/store — 쓰지 않는 스토어 자료 스크립트 (2026-09-19 이동)

지금 쓰는 것은 `scripts/store/` 에 남은 셋뿐이다.

| 파일 | 용도 |
|---|---|
| `build_release_aab.js` | `npm run build:aab` |
| `generate_all_feature_graphics.mjs` | 13개 언어 피처 그래픽. `node … ja-JP` 로 한 언어만 |
| `capture_device_screenshots.mjs` | 실기(폰)에서 스토어 스크린샷 캡처, 1080x1920 |

여기 있는 것들이 왜 은퇴했나:
- 언어별 피처 그래픽 생성기(`generate_*_feature_graphic.mjs`) — `generate_all_feature_graphics.mjs` 하나로 대체.
- `generate_localized_screenshots.js`, `generate_store_assets_*.js`, `generate_multilang_store_assets.js` —
  문구를 덧씌운 합성 이미지. 스토어 스크린샷은 실기 캡처로 바꿨다. 합성 이미지에는 「멘사」「상위 X%」 같은 앱이
  하지 않는 주장이 들어 있었다.
- `process_*_screenshots.py`, `capture_*` — 개인 다운로드 폴더의 캡처를 잘라 1080x2390 으로 만들던 것. 콘솔은 9:16 을 요구한다.
- `generate_toss_assets.js` — 토스 앱인토스용 자료(store_assets/ko-KR/toss_*). **진행 상태 미확인** — 어디에도 기록이 없다. 토스에 낼 계획이면 이 스크립트를 되살린다.
