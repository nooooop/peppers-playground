import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "K-Open API Starter",
    short_name: "K-Open API",
    description: "대한민국 기준으로 보는 공개 API 예제",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1218",
    theme_color: "#0f1218",
    lang: "ko",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml" },
    ],
  };
}

