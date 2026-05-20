import { BottomNavShell } from "../src/components/BottomNavShell";
import { GoogleWorkspacePanel } from "../src/components/GoogleWorkspacePanel";
import { KoreaWeatherPanel } from "../src/components/KoreaWeatherPanel";
import { SubwayPanel } from "../src/components/SubwayPanel";

const HOME_TABS = [
  {
    id: "subway",
    label: "지하철",
    icon: "🚇",
    content: <SubwayPanel active />,
  },
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
        <p className="page-subtitle">
          하단 메뉴에서 화면을 전환합니다. 지하철 도착·날씨·구글 연동.
        </p>
      </header>

      <BottomNavShell tabs={[...HOME_TABS]} defaultTabId="subway" />
    </main>
  );
}
