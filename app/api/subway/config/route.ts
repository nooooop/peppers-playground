import { NextResponse } from "next/server";
import { getSeoulSubwayApiKey, isSampleApiKey } from "../../../../src/lib/seoulSubway";

/** 클라이언트·배포 확인용 (인증키 값은 노출하지 않음) */
export async function GET() {
  const apiKey = getSeoulSubwayApiKey();
  const sample = isSampleApiKey(apiKey);

  return NextResponse.json({
    mode: sample ? "sample" : "development",
    configured: !sample,
    dailyLimitHint: sample
      ? "sample 키 — 요청당 최대 5건 제한"
      : "개발계정 — 포털 기준 일 1,000건 (운영계정은 별도 신청)",
  });
}
