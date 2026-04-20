import type { Metadata, Viewport } from "next";
import "./globals.css";
import { RegisterServiceWorker } from "../src/components/RegisterServiceWorker";

export const metadata: Metadata = {
  title: "K-Open API Starter",
  description: "대한민국 기준으로 보는 공개 API 예제 (PWA)",
  applicationName: "K-Open API Starter",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "K-Open API",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f1218",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}

