import { BottomNavShell } from "../src/components/BottomNavShell";
import { GoogleWorkspacePanel } from "../src/components/GoogleWorkspacePanel";
import { KoreaWeatherPanel } from "../src/components/KoreaWeatherPanel";

const HOME_TABS = [
  {
    id: "weather",
    label: "한국 날씨",
    icon: "🌤️",
    content: <KoreaWeatherPanel />,
  },
  {
    id: "google",
    label: "구글 메모·할 일",
    icon: "📝",
    content: <GoogleWorkspacePanel />,
  },
] as const;

export default function Page() {
  return (
    <main className="page-root">
      <header className="page-header">
        <h1 className="page-title">K-Open API Starter</h1>
        <p className="page-subtitle">하단 메뉴에서 화면을 전환합니다. 탭은 설정 배열에 추가해 늘릴 수 있습니다.</p>
      </header>

      <BottomNavShell tabs={[...HOME_TABS]} defaultTabId="weather" />
    </main>
  );
}
