import type { MetadataRoute } from "next";

/** Web app manifest: the name, colours and icon used when the site is added to a home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyLoginn",
    short_name: "MyLoginn",
    description: "India-based IT company building websites, mobile apps, desktop software, AI agents and digital marketing.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1f56d6",
    icons: [
      { src: "/icon.png", sizes: "any", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
