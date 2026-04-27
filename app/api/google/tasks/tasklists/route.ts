import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

type GoogleTaskListsResponse = {
  kind?: string;
  items?: Array<{ id: string; title: string }>;
};

export async function GET(req: NextRequest) {
  const token = await getToken({ req });
  const accessToken = (token as any)?.accessToken as string | undefined;

  if (!accessToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const res = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists?maxResults=20", {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json({ error: "google_api_error", status: res.status, detail: text }, { status: 502 });
  }

  const data = (await res.json()) as GoogleTaskListsResponse;
  const items = (data.items ?? []).map((x) => ({ id: x.id, title: x.title }));
  return NextResponse.json({ items });
}

