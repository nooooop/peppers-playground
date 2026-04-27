import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          // Refresh token을 받기 위한 권장 설정 (첫 동의 때 1회 발급되는 경우가 많음)
          access_type: "offline",
          prompt: "consent",
          // 최소 권한 + Tasks 읽기(예시)
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/tasks.readonly",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 최초 로그인 시 provider 토큰을 JWT에 저장
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpiresAt = account.expires_at ? account.expires_at * 1000 : undefined;
      }

      // access token이 아직 유효하면 그대로 사용
      if (token.accessToken && typeof token.accessTokenExpiresAt === "number" && Date.now() < token.accessTokenExpiresAt - 30_000) {
        return token;
      }

      // refresh token이 없으면 재로그인이 필요
      if (!token.refreshToken) return token;

      // 만료 시 refresh
      try {
        const res = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "content-type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID ?? "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
            grant_type: "refresh_token",
            refresh_token: String(token.refreshToken),
          }),
        });

        if (!res.ok) throw new Error(`refresh failed (${res.status})`);
        const refreshed = (await res.json()) as {
          access_token: string;
          expires_in: number;
          refresh_token?: string;
        };

        token.accessToken = refreshed.access_token;
        token.accessTokenExpiresAt = Date.now() + refreshed.expires_in * 1000;
        if (refreshed.refresh_token) token.refreshToken = refreshed.refresh_token;
      } catch {
        token.refreshError = true;
      }

      return token;
    },
    async session({ session, token }) {
      // 클라이언트에서는 user 정도만, API 호출은 서버 라우트에서 JWT token을 사용
      session.user = session.user ?? {};
      session.accessTokenAvailable = Boolean(token.accessToken);
      session.refreshError = Boolean(token.refreshError);
      return session;
    },
  },
};

