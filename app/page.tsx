import Link from "next/link";
import { KoreaDashboard } from "../src/components/KoreaDashboard";

export default function Page() {
  return (
    <main className="layout">
      <header className="header">
        <h1 className="title">K-Open API Starter</h1>
        <p className="subtitle">
          대한민국 기준(도시/표기/링크)으로 공개 API를 연결합니다 — Open‑Meteo(날씨), REST Countries(국가).
        </p>
        <nav className="toplinks" aria-label="문서 링크">
          <Link className="chip" href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">
            Open‑Meteo
          </Link>
          <Link className="chip" href="https://restcountries.com/" target="_blank" rel="noopener noreferrer">
            REST Countries
          </Link>
          <Link className="chip" href="https://data.go.kr/" target="_blank" rel="noopener noreferrer">
            공공데이터포털
          </Link>
        </nav>
      </header>

      <KoreaDashboard />

      <footer className="footer">
        <p className="foot-note">
          iPhone에서 “공유 → 홈 화면에 추가”로 앱처럼 설치할 수 있습니다. (PWA 설정은 다음 단계에서 완성합니다.)
        </p>
      </footer>
    </main>
  );
}

