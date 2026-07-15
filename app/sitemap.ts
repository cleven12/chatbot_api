import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = ["", "/docs", "/demo", "/integrate"];

  return paths.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/docs" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/docs" ? 0.95 : 0.8,
  }));
}
