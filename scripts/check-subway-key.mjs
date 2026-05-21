/**
 * SEOUL_OPEN_API_KEY 동작 확인 (로컬)
 * 사용: npm run check:subway-key
 */

const key = process.env.SEOUL_OPEN_API_KEY?.trim();

if (!key) {
  console.error("❌ SEOUL_OPEN_API_KEY 가 없습니다.");
  console.error("   프로젝트 루트에 .env.local 을 만들고 키를 넣은 뒤 다시 실행하세요.");
  process.exit(1);
}

if (key === "sample") {
  console.warn("⚠️  키가 'sample' 입니다. 정식 인증키를 넣으세요.");
  process.exit(1);
}

const testStation = "강남";
const url = `http://swopenapi.seoul.go.kr/api/subway/${encodeURIComponent(key)}/json/realtimeStationArrival/0/5/${encodeURIComponent(testStation)}`;

console.log(`🔑 키 길이: ${key.length}자`);
console.log(`📡 테스트 역: ${testStation}`);
console.log("   요청 중…\n");

let res;
try {
  res = await fetch(url);
} catch (err) {
  console.error("❌ 네트워크 오류:", err instanceof Error ? err.message : err);
  process.exit(1);
}

const data = await res.json();

let code = data?.realtimeStationArrival?.RESULT?.CODE;
let message = data?.realtimeStationArrival?.RESULT?.MESSAGE ?? "";
let count = 0;

if (data?.realtimeStationArrival?.row) {
  const row = data.realtimeStationArrival.row;
  count = Array.isArray(row) ? row.length : 1;
} else if (data?.errorMessage) {
  code = data.errorMessage.code ?? code;
  message = data.errorMessage.message ?? message;
  count = Array.isArray(data.realtimeArrivalList) ? data.realtimeArrivalList.length : 0;
}

console.log("   RESULT.CODE:", code ?? "(없음)");
console.log("   RESULT.MESSAGE:", message);
console.log("   도착 행 수:", count);

if (code === "INFO-000" && count > 0) {
  const first = data.realtimeArrivalList?.[0] ?? data.realtimeStationArrival?.row;
  const row = Array.isArray(first) ? first[0] : first;
  if (row) {
    console.log("   예시:", row.subwayNm || row.subwayId, row.arvlMsg2);
  }
  console.log("\n✅ 정식 키로 API 호출에 성공했습니다.");
  process.exit(0);
}

if (code === "INFO-000") {
  console.log("\n⚠️  API는 성공했으나 도착 데이터가 없습니다. (운행 시간대 확인)");
  process.exit(0);
}

console.log("\n❌ API 오류입니다. 승인·키·1~2시간 대기를 확인하세요.");
process.exit(1);
