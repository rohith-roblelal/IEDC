import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IEDC SNMIMT",
    short_name: "IEDC SNMIMT",
    description: "Innovation and Entrepreneurship Development Cell at SNMIMT",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0E27",
    theme_color: "#3B82F6",
    orientation: "portrait",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
