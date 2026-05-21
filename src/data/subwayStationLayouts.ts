import type { StationDiagramLayout } from "../lib/classifyArrivalSide";

/**
 * 역별 노선도 레이아웃 (지도상 좌/우 + API 방면 키워드)
 * - 왼쪽 열: 해당 방향(이웃 역)에서 오는 열차 도착
 * - 오른쪽 열: 반대 방향에서 오는 열차 도착
 */
export const STATION_DIAGRAM_LAYOUTS: Record<string, StationDiagramLayout> = {
  삼각지: {
    stationName: "삼각지",
    lines: [
      {
        subwayId: "1004",
        leftEndpoint: "숙대입구",
        rightEndpoint: "신용산",
        leftKeywords: [
          "숙대입구",
          "숙대",
          "서울",
          "불암",
          "방화",
          "인천",
          "회기",
          "청량리",
        ],
        rightKeywords: [
          "신용산",
          "이촌",
          "동작",
          "사당",
          "오이도",
          "당고개",
          "선바위",
          "경마공원",
        ],
      },
      {
        subwayId: "1006",
        leftEndpoint: "효창공원앞",
        rightEndpoint: "이태원",
        // 지도상 이태원·신내 쪽(오른쪽)으로 가는 열차 → 왼쪽에서 접근 → 왼쪽 표시
        leftKeywords: [
          "이태원",
          "녹사평",
          "신내",
          "봉화산",
          "태릉",
          "화랑",
          "석계",
          "망원",
          "합정",
          "광흥창",
          "대흥",
          "상수",
        ],
        // 응암·효창 쪽 → 오른쪽에서 접근 → 오른쪽 표시
        rightKeywords: [
          "효창공원앞",
          "효창",
          "응암",
          "역촌",
          "불광",
          "구산",
          "새절",
          "증산",
          "월드컵",
          "디지털미디어",
          "약수",
        ],
      },
    ],
  },
};

export function getStationDiagramLayout(stationName: string): StationDiagramLayout | null {
  return STATION_DIAGRAM_LAYOUTS[stationName] ?? null;
}
