/** 서울·수도권 지하철 노선 ID → 공식에 가까운 색상 */
export const SUBWAY_LINE_COLORS: Record<string, string> = {
  "1001": "#0052A4",
  "1002": "#00A84D",
  "1003": "#EF7C1C",
  "1004": "#00A5DE",
  "1005": "#996CAC",
  "1006": "#CD7C2F",
  "1007": "#747F00",
  "1008": "#E6186C",
  "1009": "#BDB092",
  "1063": "#77C4A3",
  "1065": "#0090D2",
  "1067": "#6CBD45",
  "1069": "#ED1B2F",
  "1071": "#F5A200",
  "1075": "#9A6292",
  "1077": "#D31177",
  "1092": "#B7C452",
  "1093": "#A17800",
  "1032": "#9F6A4E",
};

export function getSubwayLineColor(subwayId: string): string {
  return SUBWAY_LINE_COLORS[subwayId] ?? "#64748b";
}

export function getSubwayLineLabel(subwayId: string, subwayNm: string): string {
  if (subwayNm && subwayNm !== "지하철") return subwayNm;
  const labels: Record<string, string> = {
    "1001": "1호선",
    "1002": "2호선",
    "1003": "3호선",
    "1004": "4호선",
    "1005": "5호선",
    "1006": "6호선",
    "1007": "7호선",
    "1008": "8호선",
    "1009": "9호선",
  };
  return labels[subwayId] ?? `노선 ${subwayId}`;
}
