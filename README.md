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

- **날씨**: Open‑Meteo (키 없음), 시간대 `Asia/Seoul`, 기본 도시 목록(서울/부산/인천/대구/대전/광주/제주)
- **국가**: REST Countries (키 없음), 대한민국(`KR`) 정보

## 파일 구조

- `app/`: Next.js App Router (페이지/레이아웃/manifest)
- `public/sw.js`: 서비스워커(최소 오프라인 캐시)
- `src/components/`: UI 컴포넌트

