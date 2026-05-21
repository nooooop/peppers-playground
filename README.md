# K-Open API Starter (Next.js + PWA)

## 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000` 접속.

## iPhone에서 “앱처럼” 보기 (PWA)

- Safari로 접속
- **공유 버튼 → 홈 화면에 추가**

## 데이터(대한민국 기준)

- **지하철 도착**: 서울시 실시간 도착정보 Open API — 즐겨찾기 역 최대 5개, **화면이 보일 때만** 10초마다 갱신
- **날씨**: Open‑Meteo (키 없음), 시간대 `Asia/Seoul`, 기본 도시 목록(서울/부산/인천/대구/대전/광주/제주)
- **국가**: REST Countries (키 없음), 대한민국(`KR`) 정보

### 지하철 API 키 (정식 / 개발계정)

**상세 절차:** [docs/subway-api-key-setup.md](docs/subway-api-key-setup.md)

1. [공공데이터포털 — 지하철 실시간 도착정보](https://www.data.go.kr/data/15125683/openapi.do)에서 **개발계정** 활용신청 (개인 가능)
2. 마이페이지에서 **일반 인증키** 복사
3. 프로젝트 루트 `.env.local`:

```bash
SEOUL_OPEN_API_KEY=발급받은_인증키
```

4. `npm run dev` 재시작 후 `npm run check:subway-key` 로 확인
5. **배포 사이트**에는 호스팅 대시보드에 동일 변수 추가 후 **재배포**

키가 없으면 `sample` 키로 동작합니다(제한 있음).

## 파일 구조

- `app/`: Next.js App Router (페이지/레이아웃/manifest)
- `public/sw.js`: 서비스워커(최소 오프라인 캐시)
- `src/components/`: UI 컴포넌트

