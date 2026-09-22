# 경쟁 스도쿠 앱 사용자 불편 및 요구사항 분석 (User Requests & Complaints)

- 대상 데이터: 상위 10개 스도쿠 앱 raw 리뷰 2,722건 (en-US 1,919건, ko-KR 803건)
- 정렬 기준: 실제 매칭된 고유 리뷰 건수 내림차순
- 근거 원칙: 각 항목별 최소 3건 이상의 실제 `패키지#review_id` 인용 표기

## 분류별 요약 통계

| 순위 | 분류 | 불편 및 요구사항 내용 | 매칭 건수 |
|---|---|---|---|
| 1 | 광고 | 플레이 흐름을 끊는 전면 광고 및 과도한 광고 노출 불만 | 301건 |
| 2 | 화면·글자 | 글자/숫자 크기가 너무 작거나 다크 모드 및 색상 대비가 낮아 눈이 피로함 | 34건 |
| 3 | 조작감 | 숫자 먼저 선택 vs 칸 먼저 선택 방식의 유연성 부족 및 터치 오인식/실수 카운트 강제 | 31건 |
| 4 | 난이도 | 난이도 구분이 불분명하거나(전문가/마스터 난이도가 너무 쉬움 또는 터무니없는 추측 필요) | 24건 |
| 5 | 버그 | 게임 프리징, 앱 강제 종료, 과도한 배터리 소모 및 기기 발열 문제 | 17건 |
| 6 | 결제 | 광고 제거 구매 후에도 광고가 계속 나오거나 구독 유도에 대한 불만 | 11건 |
| 7 | 힌트 | 단순 숫자 정답만 알려주고 왜 그 숫자가 들어가는지 논리적 설명을 제공하지 않는 힌트 불만 | 10건 |
| 8 | 메모 | 메모(연필 마크) 자동 삭제 오류 또는 수동 메모 토글 조작의 불편함 | 6건 |
| 9 | 오프라인 | 오프라인 비행기 탑승 모드에서 플레이 불가 또는 광고 캐싱 문제 | 5건 |
| 10 | 저장·기기 이동 | 기기 변경 시 게임 진행 기록/통계 손실 및 클라우드 동기화 미지원 | 3건 |

## 상세 분석 및 근거 리뷰 인용

### [광고] 플레이 흐름을 끊는 전면 광고 및 과도한 광고 노출 불만 (301건)

- [광고] 플레이 흐름을 끊는 전면 광고 및 과도한 광고 노출 불만 — 근거: `com.brainium.sudoku.free#af0a8137-eecc-44fd-8370-516678bdcc60`, `com.brainium.sudoku.free#050db646-83aa-4acc-b74b-39a26a265489`, `com.brainium.sudoku.free#b23ea39c-4fbd-44fe-88d8-e966e082a784`, `com.brainium.sudoku.free#7bc04cdc-9fd5-4a0d-9da1-2ea579b5cd4c`, `com.brainium.sudoku.free#191817fb-95f4-4801-8561-1214795c2abe` 외 296건 (301건)

### [화면·글자] 글자/숫자 크기가 너무 작거나 다크 모드 및 색상 대비가 낮아 눈이 피로함 (34건)

- [화면·글자] 글자/숫자 크기가 너무 작거나 다크 모드 및 색상 대비가 낮아 눈이 피로함 — 근거: `com.brainium.sudoku.free#09331ad6-bb9b-4e6b-8b6a-ac693359635f`, `com.brainium.sudoku.free#8e37bcde-9445-40c1-948e-6506d8e4cfb7`, `com.conceptispuzzles.multisudoku#ca239eb7-4458-4acd-9a90-1cb4d25669f5`, `com.conceptispuzzles.multisudoku#bc7d7be1-cfb3-4ab6-a745-9bc5cf7b4967`, `com.conceptispuzzles.multisudoku#95fe0024-0c05-4031-b0cc-99b26d653773` 외 29건 (34건)

### [조작감] 숫자 먼저 선택 vs 칸 먼저 선택 방식의 유연성 부족 및 터치 오인식/실수 카운트 강제 (31건)

- [조작감] 숫자 먼저 선택 vs 칸 먼저 선택 방식의 유연성 부족 및 터치 오인식/실수 카운트 강제 — 근거: `com.brainium.sudoku.free#0df818ac-99f2-4fa3-863e-7b80eb919aff`, `com.brainium.sudoku.free#b51ba033-7128-42c8-be61-1124820cb306`, `com.conceptispuzzles.multisudoku#1df2135c-87c9-4c7f-aa59-d20f6dd65bbf`, `com.conceptispuzzles.multisudoku#9a62b7bb-6930-4c95-a877-051e2fb90cc7`, `com.easybrain.killer.sudoku.free#e15165ae-3f59-4c94-8385-d536c18affe3` 외 26건 (31건)

### [난이도] 난이도 구분이 불분명하거나(전문가/마스터 난이도가 너무 쉬움 또는 터무니없는 추측 필요) (24건)

- [난이도] 난이도 구분이 불분명하거나(전문가/마스터 난이도가 너무 쉬움 또는 터무니없는 추측 필요) — 근거: `com.brainium.sudoku.free#cb189220-0dff-4e93-b006-351c777a4c33`, `com.conceptispuzzles.multisudoku#05991591-dfab-4fca-bb5b-2dbfbfbb7a1b`, `com.conceptispuzzles.multisudoku#5f5d4f15-ca4b-49cf-9668-2d4a5b808b04`, `com.conceptispuzzles.multisudoku#cb69c171-7872-44cb-8d51-142c8fa3a9f1`, `com.easybrain.killer.sudoku.free#b67769aa-32da-43e0-a442-20e48c844513` 외 19건 (24건)

### [버그] 게임 프리징, 앱 강제 종료, 과도한 배터리 소모 및 기기 발열 문제 (17건)

- [버그] 게임 프리징, 앱 강제 종료, 과도한 배터리 소모 및 기기 발열 문제 — 근거: `com.brainium.sudoku.free#a3fcd4f4-65ee-4c12-bea4-fdc0cbbe6c26`, `com.brainium.sudoku.free#de6d1873-125e-41c4-9987-2dd1320ca690`, `com.brainium.sudoku.free#1c3b7884-c118-4160-8a8e-10c86530a31d`, `com.brainium.sudoku.free#caa6d8d4-fbbb-480f-8e21-15f0ad2c540b`, `com.brainium.sudoku.free#62e0c99c-28f9-46d9-9a21-aafde4c36309` 외 12건 (17건)

### [결제] 광고 제거 구매 후에도 광고가 계속 나오거나 구독 유도에 대한 불만 (11건)

- [결제] 광고 제거 구매 후에도 광고가 계속 나오거나 구독 유도에 대한 불만 — 근거: `com.brainium.sudoku.free#c4617825-28e5-436d-ac25-9fe5ec2622a6`, `com.brainium.sudoku.free#7cf59277-26a4-4e35-881a-ebdc6ae59cfe`, `com.mathbrain.sudoku#727f77fe-4aa4-474b-8767-952caa9325c7`, `com.mathbrain.sudoku#1cb12518-2741-4b21-9209-165a6324c6f4`, `com.mathbrain.sudoku#0d3fe324-791b-435d-9d06-fb0f2031b301` 외 6건 (11건)

### [힌트] 단순 숫자 정답만 알려주고 왜 그 숫자가 들어가는지 논리적 설명을 제공하지 않는 힌트 불만 (10건)

- [힌트] 단순 숫자 정답만 알려주고 왜 그 숫자가 들어가는지 논리적 설명을 제공하지 않는 힌트 불만 — 근거: `com.brainium.sudoku.free#5e08ba52-9d0a-404c-8dc4-dafb333c1a4d`, `com.brainium.sudoku.free#9e623d06-e888-4a23-9958-e61af1b673a6`, `com.brainium.sudoku.free#7cfb813f-ecc3-418b-83b9-54f409f4159e`, `com.conceptispuzzles.multisudoku#51b3348a-b7a7-435b-859d-75b8020c35cf`, `com.conceptispuzzles.multisudoku#9eb5b471-e81e-4131-b16b-6c34df0fbc4a` 외 5건 (10건)

### [메모] 메모(연필 마크) 자동 삭제 오류 또는 수동 메모 토글 조작의 불편함 (6건)

- [메모] 메모(연필 마크) 자동 삭제 오류 또는 수동 메모 토글 조작의 불편함 — 근거: `com.brainium.sudoku.free#90be26a3-60a4-47e6-b582-d3f16d583fd8`, `com.gamovation.sudoku#445f1555-f477-4bb8-aca3-8b9d6964cc5c`, `easy.sudoku.puzzle.solver.free#84a5f9e6-c212-4710-9c2b-8793aba2dfcc`, `ee.dustland.android.dustlandsudoku#0b980153-7e29-411e-963e-5c1cf9cb0591`, `ee.dustland.android.dustlandsudoku#e507397f-ad2b-43ca-b19e-36e42dbb13b4` 외 1건 (6건)

### [오프라인] 오프라인 비행기 탑승 모드에서 플레이 불가 또는 광고 캐싱 문제 (5건)

- [오프라인] 오프라인 비행기 탑승 모드에서 플레이 불가 또는 광고 캐싱 문제 — 근거: `com.brainium.sudoku.free#e53fdaf1-33c5-4997-996a-a4337bb5266e`, `com.easybrain.sudoku.android#c4f014e7-ecbd-4d56-b830-79992de271a8`, `com.gamovation.sudoku#1b8cca87-2e99-4202-8ab5-b867bc0fa11e`, `com.mathbrain.sudoku#dded672a-7243-4e30-82cb-1fa2d9e00395`, `easy.sudoku.puzzle.solver.free#bb0f7959-1950-4d77-94eb-847166c4d281` (5건)

### [저장·기기 이동] 기기 변경 시 게임 진행 기록/통계 손실 및 클라우드 동기화 미지원 (3건)

- [저장·기기 이동] 기기 변경 시 게임 진행 기록/통계 손실 및 클라우드 동기화 미지원 — 근거: `com.easybrain.sudoku.android#3a61c3cc-f27d-4299-815f-400877abcd63`, `com.easybrain.sudoku.android#a110213f-ce78-4be9-ba83-69fc8f76ccea`, `com.gamovation.sudoku#405d3f99-cb5d-49e3-a005-cff51b571f95` (3건)

