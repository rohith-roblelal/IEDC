import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IEDC SNMIMT",
    short_name: "IEDC SNMIMT",
    description: "Innovation and Entrepreneurship Development Cell at SNM Institute of Management and Technology, Kerala.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#05081A",
    theme_color: "#A855F7",
    icons: [
      {
        src: "/icon.png",
        sizes: "256x256",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
