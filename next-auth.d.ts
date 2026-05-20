import "next-auth";

declare module "next-auth" {
  interface Session {
    accessTokenAvailable?: boolean;
    refreshError?: boolean;
  }
}

