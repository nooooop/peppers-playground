/** 서울·수도권 지하철 노선 ID → 공식에 가까운 색상 */
export const SUBWAY_LINE_COLORS: Record<string, string> = {
  "1001": "#0052A4",
  "1002": "#00A84D",
  "1003": "#EF7C1C",
  "1004": "#00A5DE",
  "1005": "#996CAC",
  "1006": "#A06925",
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

const SUBWAY_LINE_LABELS: Record<string, string> = {
  "1001": "1호선",
  "1002": "2호선",
  "1003": "3호선",
  "1004": "4호선",
  "1005": "5호선",
  "1006": "6호선",
  "1007": "7호선",
  "1008": "8호선",
  "1009": "9호선",
  "1063": "경의중앙선",
  "1065": "공항철도",
  "1067": "인천1호선",
  "1069": "인천2호선",
  "1071": "수인분당선",
  "1075": "수인선",
  "1077": "신분당선",
  "1092": "우이신설선",
  "1093": "김포골드라인",
  "1032": "GTX-A",
};

/** 흰 원 배지 안에 넣을 짧은 노선 표기 */
const SUBWAY_LINE_BADGES: Record<string, string> = {
  "1001": "1",
  "1002": "2",
  "1003": "3",
  "1004": "4",
  "1005": "5",
  "1006": "6",
  "1007": "7",
  "1008": "8",
  "1009": "9",
  "1063": "경",
  "1065": "공",
  "1067": "인1",
  "1069": "인2",
  "1071": "분",
  "1075": "수",
  "1077": "신",
  "1092": "우",
  "1093": "김",
  "1032": "G",
};

export function getSubwayLineLabel(subwayId: string, subwayNm: string): string {
  if (subwayNm && subwayNm !== "지하철") return subwayNm;
  return SUBWAY_LINE_LABELS[subwayId] ?? `노선 ${subwayId}`;
}

export function getSubwayLineBadge(subwayId: string): string {
  const badge = SUBWAY_LINE_BADGES[subwayId];
  if (badge) return badge;

  const label = SUBWAY_LINE_LABELS[subwayId];
  if (label?.match(/^\d호선/)) return label.charAt(0);

  return label?.charAt(0) ?? "?";
}
